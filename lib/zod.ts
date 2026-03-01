import { z } from 'zod'
import { MAX_FILE_SIZE } from './constants'

// generic file validator – ensures value is a File instance
const fileInstance = z
  .custom<File>((v) => v instanceof File, { message: 'Invalid file' })

export const UploadSchema = z.object({
  pdfFile: fileInstance
    .refine((f) => f.type === 'application/pdf', {
      message: 'Must be a PDF document',
    })
    .refine((f) => f.size <=MAX_FILE_SIZE, {
      message: 'File must be smaller than 50 MB',
    }),
  coverImage: fileInstance
    .optional()
    .refine((f) => !f || f.type.startsWith('image/'), {
      message: 'Cover must be an image',
    }),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  voice: z.enum(['dave', 'daniel', 'chris', 'rachel', 'sarah']),
})
