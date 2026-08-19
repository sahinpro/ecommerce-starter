export const metadata = {
  title: 'Shipping & Returns | Sukoon'
};

export default function ShippingPage() {
  return (
    <div className='mx-auto max-w-2xl px-10 py-20'>
      <h1 className='font-serif text-4xl'>Shipping & Returns</h1>
      <div className='text-muted-foreground mt-8 space-y-6 leading-relaxed'>
        <p>
          Free express shipping on all Bangladesh orders over 5,000 TK. Standard delivery typically
          arrives within 2–4 business days.
        </p>
        <p>
          Returns are accepted within 14 days for unworn items with original tags. Initiate a return
          by contacting our support team.
        </p>
      </div>
    </div>
  );
}
