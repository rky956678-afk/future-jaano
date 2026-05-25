import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  FESTIVALS_2026,
  TYPE_LABEL,
  TYPE_COLOR,
  festivalsForMonth,
  festivalsForDate,
  type FestivalType,
} from '@/lib/festivals';

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Calendar() {
  const { t, language } = useLanguage();
  const today = new Date();
  const initialYear = today.getFullYear() === 2026 ? 2026 : 2026;
  const initialMonth = today.getFullYear() === 2026 ? today.getMonth() : 0;
  const [year, setYear] = React.useState(initialYear);
  const [month, setMonth] = React.useState(initialMonth);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    today.getFullYear() === 2026 ? toDateStr(2026, today.getMonth(), today.getDate()) : null
  );
  const [filter, setFilter] = React.useState<FestivalType | 'all'>('all');

  const isHi = language === 'hi';
  const monthNames = isHi ? MONTHS_HI : MONTHS_EN;
  const weekdayNames = isHi ? WEEKDAYS_HI : WEEKDAYS_EN;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthFestivals = festivalsForMonth(year, month);

  const filteredAllFestivals = React.useMemo(() => {
    return filter === 'all' ? FESTIVALS_2026 : FESTIVALS_2026.filter(f => f.type === filter);
  }, [filter]);

  const upcomingFestivals = React.useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return filteredAllFestivals.filter(f => f.date >= todayStr).slice(0, 8);
  }, [filteredAllFestivals, today]);

  const selectedFestivals = selectedDate ? festivalsForDate(selectedDate) : [];

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, dateStr: toDateStr(year, month, d) });

  const todayStr = today.toISOString().slice(0, 10);

  const filterTypes: Array<FestivalType | 'all'> = ['all', 'hindu', 'muslim', 'sikh', 'jain', 'christian', 'national', 'regional'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary drop-shadow-md flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            {t('Festival Calendar 2026', 'त्यौहार कैलेंडर 2026')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('All Indian festivals, holidays and auspicious days.', 'सभी भारतीय त्यौहार, छुट्टियाँ और शुभ दिन।')}
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {filterTypes.map(ft => (
            <button
              key={ft}
              onClick={() => setFilter(ft)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                filter === ft
                  ? 'bg-primary text-primary-foreground border-primary shadow'
                  : 'bg-card/40 text-muted-foreground border-border/50 hover:border-primary/50'
              }`}
            >
              {ft === 'all' ? t('All', 'सभी') : TYPE_LABEL[ft][isHi ? 'hi' : 'en']}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-primary">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdayNames.map((w, i) => (
                <div key={w} className={`text-center text-xs font-semibold py-2 ${i === 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (cell.day === null) return <div key={`empty-${i}`} className="aspect-square" />;
                const dayFestivals = festivalsForDate(cell.dateStr!);
                const filtered = filter === 'all' ? dayFestivals : dayFestivals.filter(f => f.type === filter);
                const hasFestival = filtered.length > 0;
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const dow = (firstDay + cell.day - 1) % 7;
                const isSunday = dow === 0;
                const isHoliday = filtered.some(f => f.gazetted);

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition relative border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                        : isToday
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : hasFestival
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-100 hover:bg-amber-500/25'
                        : isSunday || isHoliday
                        ? 'border-transparent text-red-300 hover:bg-card'
                        : 'border-transparent text-foreground/80 hover:bg-card'
                    }`}
                  >
                    <span className={isToday && !isSelected ? 'font-bold' : ''}>{cell.day}</span>
                    {hasFestival && (
                      <div className="flex gap-0.5 mt-0.5">
                        {filtered.slice(0, 3).map((f, idx) => (
                          <span key={idx} className={`w-1 h-1 rounded-full ${
                            f.type === 'hindu' ? 'bg-orange-400' :
                            f.type === 'muslim' ? 'bg-emerald-400' :
                            f.type === 'sikh' ? 'bg-amber-400' :
                            f.type === 'jain' ? 'bg-yellow-400' :
                            f.type === 'christian' ? 'bg-red-400' :
                            f.type === 'national' ? 'bg-blue-400' :
                            'bg-purple-400'
                          }`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected date details */}
            {selectedDate && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <h3 className="font-semibold text-primary mb-2">
                  {new Date(selectedDate).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </h3>
                {selectedFestivals.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedFestivals.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${TYPE_COLOR[f.type]}`}>
                          {TYPE_LABEL[f.type][isHi ? 'hi' : 'en']}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{isHi ? f.nameHi : f.nameEn}</p>
                          {f.gazetted && (
                            <p className="text-xs text-amber-300">
                              {t('Gazetted Holiday', 'राजपत्रित अवकाश')}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('No festivals on this date.', 'इस तिथि पर कोई त्यौहार नहीं।')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* This month's festivals + upcoming */}
          <div className="space-y-6">
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5">
              <h3 className="font-serif font-bold text-lg text-primary mb-3">
                {t('Festivals This Month', 'इस माह के त्यौहार')}
              </h3>
              {monthFestivals.length > 0 ? (
                <ul className="space-y-2">
                  {monthFestivals.map((f, i) => {
                    const d = new Date(f.date);
                    return (
                      <li
                        key={i}
                        onClick={() => setSelectedDate(f.date)}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition"
                      >
                        <div className="text-center shrink-0 w-12">
                          <div className="text-lg font-bold text-amber-400 leading-none">{d.getDate()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{weekdayNames[d.getDay()]}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground line-clamp-2">{isHi ? f.nameHi : f.nameEn}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLOR[f.type]}`}>
                            {TYPE_LABEL[f.type][isHi ? 'hi' : 'en']}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('No festivals this month.', 'इस माह कोई त्यौहार नहीं।')}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-5">
              <h3 className="font-serif font-bold text-lg text-primary mb-3">
                {t('Upcoming Festivals', 'आगामी त्यौहार')}
              </h3>
              {upcomingFestivals.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingFestivals.map((f, i) => {
                    const d = new Date(f.date);
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="text-center shrink-0 w-12">
                          <div className="text-[10px] text-muted-foreground uppercase">{monthNames[d.getMonth()].slice(0, 3)}</div>
                          <div className="text-lg font-bold text-primary leading-none">{d.getDate()}</div>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{isHi ? f.nameHi : f.nameEn}</p>
                          {f.gazetted && (
                            <p className="text-[10px] text-amber-300">{t('Gazetted Holiday', 'राजपत्रित अवकाश')}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('No upcoming festivals.', 'कोई आगामी त्यौहार नहीं।')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
