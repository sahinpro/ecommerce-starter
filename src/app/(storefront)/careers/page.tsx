export const metadata = {
  title: 'Careers | Sukoon'
};

export default function CareersPage() {
  return (
    <div className='mx-auto max-w-2xl px-10 py-20'>
      <h1 className='font-serif text-4xl'>Careers</h1>
      <p className='text-muted-foreground mt-6 leading-relaxed'>
        We&apos;re building Sukoon in Dhaka. Check back soon for open roles, or
        email{' '}
        <a href='mailto:careers@sukoon.com' className='text-foreground underline'>
          careers@sukoon.com
        </a>
        .
      </p>
    </div>
  );
}
