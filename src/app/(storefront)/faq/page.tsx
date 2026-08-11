export const metadata = {
  title: 'FAQs | Sukoon'
};

const faqs = [
  {
    q: 'What is your return policy?',
    a: 'Unworn items with tags may be returned within 14 days of delivery.'
  },
  {
    q: 'Do you ship internationally?',
    a: 'We currently ship across Bangladesh with express options at checkout.'
  },
  {
    q: 'How should I care for my garments?',
    a: 'Each product page includes specific care instructions under the Care tab.'
  }
];

export default function FaqPage() {
  return (
    <div className='mx-auto max-w-2xl px-10 py-20'>
      <h1 className='font-serif text-4xl'>FAQs</h1>
      <dl className='mt-10 space-y-8'>
        {faqs.map((faq) => (
          <div key={faq.q}>
            <dt className='font-medium'>{faq.q}</dt>
            <dd className='text-muted-foreground mt-2 text-sm leading-relaxed'>{faq.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
