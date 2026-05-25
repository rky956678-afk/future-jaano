import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('Contact Us', 'संपर्क करें')}
        </h1>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          {t('Have questions about our readings or need help with a premium plan? We are here to assist you on your spiritual journey.', 'हमारी सेवाओं के बारे में प्रश्न हैं या प्रीमियम योजना में सहायता चाहिए? हम आपकी आध्यात्मिक यात्रा में आपकी सहायता करने के लिए यहां हैं।')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-foreground/90">{t('Get in Touch', 'संपर्क में रहें')}</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('Email Support', 'ईमेल समर्थन')}</h3>
                  <p className="text-muted-foreground text-sm mt-1">support@futurejaano.com</p>
                  <p className="text-muted-foreground text-sm">{t('We reply within 24 hours', 'हम 24 घंटे के भीतर उत्तर देते हैं')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('Phone Support', 'फ़ोन समर्थन')}</h3>
                  <p className="text-muted-foreground text-sm mt-1">+91 1800-123-4567</p>
                  <p className="text-muted-foreground text-sm">{t('Mon-Sat, 9AM to 6PM IST', 'सोम-शनि, सुबह 9 से शाम 6 बजे IST')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('Office', 'कार्यालय')}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Spiritual Tech Hub<br />
                    Sector 44, Gurugram<br />
                    Haryana 122003, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-foreground/90 mb-6">{t('Send a Message', 'संदेश भेजें')}</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">{t('Name', 'नाम')}</label>
                <input type="text" className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" placeholder={t('Your name', 'आपका नाम')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">{t('Email', 'ईमेल')}</label>
                <input type="email" className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" placeholder={t('Your email address', 'आपका ईमेल पता')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">{t('Message', 'संदेश')}</label>
                <textarea rows={5} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none" placeholder={t('How can we help you?', 'हम आपकी कैसे मदद कर सकते हैं?')}></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 mt-2 hover:bg-primary/90 transition-colors">
                {t('Send Message', 'संदेश भेजें')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
