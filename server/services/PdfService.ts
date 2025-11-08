import { Lambda } from "aws-sdk";
import { supabase } from "../index";

export class PdfService {
  static async generateSubmissionPdf(data: {
    answers: any;
    experimentState: any;
    meta: any;
  }): Promise<Buffer> {
    // console.log("AWS Region:", process.env.AWS_REGION);
    const lambda = new Lambda({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    // console.log(lambda);
    const params = {
      FunctionName: process.env.PDF_LAMBDA_FUNCTION_NAME!,
      Payload: JSON.stringify({
        body: JSON.stringify(data),
      }),
    };

    const result = await lambda.invoke(params).promise();
    const response = JSON.parse(result.Payload as string);

    if (response.statusCode !== 200) {
      throw new Error("PDF generation failed");
    }

    return Buffer.from(response.body, "base64");
  }

  static async saveSubmission(
    studentId: string,
    experimentId: string,
    pdfBuffer: Buffer
  ): Promise<string> {
    const filename = `${studentId}_${experimentId}_${Date.now()}.pdf`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("experiment-submissions")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("experiment-submissions").getPublicUrl(filename);

    return publicUrl;
  }

  static async getSubmission(pdfUrl: string): Promise<Buffer> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }
    return Buffer.from(await response.arrayBuffer());
  }
}
