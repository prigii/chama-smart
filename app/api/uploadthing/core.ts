import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      try {
        const session = await auth();
        console.log("UploadThing Middleware - Session:", session?.user?.email);
        if (!session?.user) throw new Error("Unauthorized - No Session");
        return { userId: session.user.id };
      } catch (error) {
        console.error("UploadThing Middleware Error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  chamaLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      try {
        const session = await auth();
        console.log("UploadThing Middleware (Chama) - Session:", session?.user?.email);
        if (!session?.user || session.user.role !== "ADMIN") {
          throw new Error("Unauthorized - Admin only");
        }
        return { chamaId: session.user.chamaId };
      } catch (error) {
        console.error("UploadThing Middleware (Chama) Error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chama logo upload complete for:", metadata.chamaId);
      console.log("Logo URL:", file.url);
      return { chamaId: metadata.chamaId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
