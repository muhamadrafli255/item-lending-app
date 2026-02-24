import { z } from "zod"

export const itemSchema = z.object({
    name: z.string().min(2, "Nama barang minimal 2 karakter"),
    description: z.string().min(5, "Deskripsi minimal 5 karakter"),
    stock: z.number().int().min(0, "Stok tidak boleh negatif"),
    image: z.string().optional(),
})

export type ItemSchema = z.infer<typeof itemSchema>
