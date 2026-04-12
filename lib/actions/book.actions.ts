'use server'
import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";
import { success } from "zod";

export const getAllBooks = async () => {
    try {
        await connectToDatabase();
        const books = await Book.find().sort({ createdAt: -1 });
        const formattedBooks = books.map((book) => ({
            ...book.toObject(),
            _id: book._id.toString(),
        }))
        console.log('Books', formattedBooks);
        return {
            exists: true,
            data: serializeData(formattedBooks),
        }
    } catch (error) {
        console.error('Error getting books', error);
        return {
            success: false,
            error: error,
        }
    }
}
export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(title);
        const existingBook = await Book.findOne({ slug }).lean();
        if (existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }
        return {
            exists: false,
        }


    } catch (error) {
        console.error('Error checking book exists');
        return {
            exists: false,
            error: error,
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title);
        const existingBook = await Book.findOne({ slug }).lean();
        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExist: true,
            }
        }
        //Todo: Check subscription limits before creating a book.
        const book = await Book.create({ ...data, slug, totalSegments: 0 });
        return {
            success: true,
            data: serializeData(book),
        }
    } catch (error) {
        console.error('Error creating a book', error);
        return {
            success: false,
            error: error,
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();
        console.log('Saving book segments... this might take a while');
        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));
        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });
        console.log('Book Segments Saved successfully');
        return {
            success: true,
            data: { segmentCreated: segments.length }
        }

    } catch (error) {
        console.error('Error saving segments', error);
        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        console.log('deleted book and book segment due to saveBookSegements failure.')
        return {
            success: false,
            error: error,
        }
    }
}