import json
import re
from typing import Dict, Any, List
from urllib.parse import quote
from urllib.request import urlopen, Request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Поиск определений русских слов через Викисловарь
    Args: event с параметром word в queryStringParameters
    Returns: JSON с определениями, синонимами и примерами
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    word = params.get('word', '').strip()
    
    if not word:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Параметр word обязателен'}),
            'isBase64Encoded': False
        }
    
    try:
        url = f'https://ru.wiktionary.org/api/rest_v1/page/html/{quote(word)}'
        req = Request(url, headers={'User-Agent': 'DictionaryBot/1.0'})
        
        with urlopen(req, timeout=10) as response:
            html_content = response.read().decode('utf-8')
        
        definitions = parse_definitions(html_content, word)
        
        if not definitions:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Слово не найдено'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'word': word,
                'definitions': definitions
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка при получении данных: {str(e)}'}),
            'isBase64Encoded': False
        }

def parse_definitions(html: str, word: str) -> List[Dict[str, Any]]:
    """Парсинг HTML Викисловаря для извлечения определений"""
    definitions = []
    def_id = 1
    
    section_match = re.search(r'<section[^>]*data-mw-section-id="1"[^>]*>(.*?)</section>', html, re.DOTALL)
    if section_match:
        section_html = section_match.group(1)
        
        ol_pattern = re.compile(r'<ol>(.*?)</ol>', re.DOTALL)
        ol_matches = ol_pattern.findall(section_html)
        
        for ol_content in ol_matches[:3]:
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', ol_content, re.DOTALL)
            
            for li_content in li_items[:5]:
                clean_text = re.sub(r'<[^>]+>', '', li_content)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                if 10 < len(clean_text) < 500:
                    parts = clean_text.split('◆')
                    meaning = parts[0].strip()
                    examples = [ex.strip() for ex in parts[1:] if ex.strip() and len(ex.strip()) > 5]
                    
                    definitions.append({
                        'id': def_id,
                        'meaning': meaning,
                        'partOfSpeech': 'определение',
                        'examples': examples[:2]
                    })
                    def_id += 1
    
    if not definitions:
        p_tags = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
        for p_content in p_tags[:3]:
            clean_text = re.sub(r'<[^>]+>', '', p_content)
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            if 30 < len(clean_text) < 300:
                definitions.append({
                    'id': def_id,
                    'meaning': clean_text,
                    'partOfSpeech': '',
                    'examples': []
                })
                def_id += 1
                break
    
    return definitions[:10]