import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import { getAllBooks } from '@/lib/actions/book.actions'
import { sampleBooks } from '@/lib/constants';
import { Book } from '@/types';

const page = async () => {
  const bookResults = await getAllBooks()
  const books = bookResults?.data || []

  return (
    <main className='wrapper container'>
      <HeroSection />
      <div className="library-books-grid">
        {books.map((book: any) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  )
}
export default page
