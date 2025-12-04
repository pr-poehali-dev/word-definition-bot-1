import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Definition {
  id: number;
  meaning: string;
  partOfSpeech: string;
  examples: string[];
}

interface Word {
  word: string;
  definitions: Definition[];
  synonyms: string[];
}

const mockDictionary: Record<string, Word> = {
  'свет': {
    word: 'свет',
    definitions: [
      {
        id: 1,
        meaning: 'Электромагнитное излучение, воспринимаемое глазом и делающее окружающее видимым',
        partOfSpeech: 'существительное',
        examples: [
          'В комнате погас свет',
          'Солнечный свет проникал через окно',
          'Включи, пожалуйста, свет'
        ]
      },
      {
        id: 2,
        meaning: 'Земля, вселенная, мир',
        partOfSpeech: 'существительное',
        examples: [
          'Путешествие вокруг света',
          'Появиться на свет',
          'Увидеть свет'
        ]
      },
      {
        id: 3,
        meaning: 'Общество, люди',
        partOfSpeech: 'существительное',
        examples: [
          'Выход в свет',
          'Высший свет',
          'Светская жизнь'
        ]
      }
    ],
    synonyms: ['освещение', 'сияние', 'лучи', 'мир', 'вселенная']
  },
  'книга': {
    word: 'книга',
    definitions: [
      {
        id: 1,
        meaning: 'Печатное издание в виде переплетённых листов с текстом',
        partOfSpeech: 'существительное',
        examples: [
          'Читать книгу',
          'Купить книгу в магазине',
          'Интересная книга'
        ]
      },
      {
        id: 2,
        meaning: 'Крупное научное или литературное произведение',
        partOfSpeech: 'существительное',
        examples: [
          'Книга жизни',
          'Написать книгу',
          'Издать книгу'
        ]
      }
    ],
    synonyms: ['том', 'издание', 'произведение', 'фолиант']
  },
  'время': {
    word: 'время',
    definitions: [
      {
        id: 1,
        meaning: 'Форма протекания физических и психических процессов, условие возможности изменения',
        partOfSpeech: 'существительное',
        examples: [
          'Время летит быстро',
          'У меня нет времени',
          'Сколько времени?'
        ]
      },
      {
        id: 2,
        meaning: 'Период, эпоха',
        partOfSpeech: 'существительное',
        examples: [
          'Во время войны',
          'Наше время',
          'Старые времена'
        ]
      }
    ],
    synonyms: ['период', 'эпоха', 'час', 'момент', 'пора']
  }
};

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (query && mockDictionary[query]) {
      setCurrentWord(mockDictionary[query]);
    } else if (query) {
      setCurrentWord({
        word: query,
        definitions: [{
          id: 1,
          meaning: 'Слово не найдено в словаре. Попробуйте другое слово.',
          partOfSpeech: '',
          examples: []
        }],
        synonyms: []
      });
    }
  };

  const toggleFavorite = (word: string) => {
    if (favorites.includes(word)) {
      setFavorites(favorites.filter(w => w !== word));
    } else {
      setFavorites([...favorites, word]);
    }
  };

  const loadFavoriteWord = (word: string) => {
    if (mockDictionary[word]) {
      setCurrentWord(mockDictionary[word]);
      setSearchQuery(word);
      setActiveTab('search');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Словарь
          </h1>
          <p className="text-muted-foreground text-lg">
            Подробные определения и примеры употребления слов
          </p>
        </div>

        <div className="mb-8 flex gap-3 justify-center">
          <Button
            variant={activeTab === 'search' ? 'default' : 'outline'}
            onClick={() => setActiveTab('search')}
            className="min-w-[140px]"
          >
            <Icon name="Search" size={18} className="mr-2" />
            Поиск
          </Button>
          <Button
            variant={activeTab === 'favorites' ? 'default' : 'outline'}
            onClick={() => setActiveTab('favorites')}
            className="min-w-[140px]"
          >
            <Icon name="Heart" size={18} className="mr-2" />
            Избранное ({favorites.length})
          </Button>
        </div>

        {activeTab === 'search' && (
          <>
            <Card className="p-6 mb-8 shadow-lg animate-scale-in">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Введите слово для поиска..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg h-12"
                />
                <Button onClick={handleSearch} size="lg" className="px-8">
                  <Icon name="Search" size={20} />
                </Button>
              </div>
            </Card>

            {currentWord && (
              <div className="space-y-6 animate-fade-in">
                <Card className="p-8 shadow-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>
                      {currentWord.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-sm text-muted-foreground">Синонимы:</span>
                          {currentWord.synonyms.map((synonym, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm">
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(currentWord.word)}
                      className="mt-1"
                    >
                      <Icon
                        name="Heart"
                        size={24}
                        className={favorites.includes(currentWord.word) ? 'fill-primary text-primary' : ''}
                      />
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-8">
                    {currentWord.definitions.map((def, idx) => (
                      <div key={def.id} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            {def.partOfSpeech && (
                              <Badge variant="outline" className="mb-2">
                                {def.partOfSpeech}
                              </Badge>
                            )}
                            <p className="text-lg leading-relaxed">{def.meaning}</p>
                          </div>
                        </div>

                        {def.examples.length > 0 && (
                          <div className="ml-12 space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Icon name="Quote" size={16} />
                              Примеры употребления:
                            </p>
                            <div className="space-y-2">
                              {def.examples.map((example, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="pl-4 border-l-2 border-primary/30 py-1"
                                >
                                  <p className="text-muted-foreground italic">{example}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {idx < currentWord.definitions.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {activeTab === 'favorites' && (
          <Card className="p-8 shadow-lg animate-scale-in">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Heart" size={64} className="mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg text-muted-foreground">
                  У вас пока нет избранных слов
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Добавляйте слова в избранное при поиске
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold mb-6">Мои избранные слова</h3>
                {favorites.map((word, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => loadFavoriteWord(word)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="BookOpen" size={20} className="text-primary" />
                      <span className="text-lg font-medium">{word}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(word);
                      }}
                    >
                      <Icon name="X" size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
