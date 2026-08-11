export const metadata = {
  title: 'Contact | Sukoon'
};

export default function ContactPage() {
  return (
    <div className='mx-auto max-w-2xl px-10 py-20'>
      <h1 className='font-serif text-4xl'>Contact</h1>
      <p className='text-muted-foreground mt-6 leading-relaxed'>
        For order support, wholesale inquiries, or press — reach us at{' '}
        <a href='mailto:hello@sukoon.com' className='text-foreground underline'>
          hello@sukoon.com
        </a>
        .
      </p>
    </div>
  );
}
