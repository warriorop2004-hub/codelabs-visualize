import PDFDocument from 'pdfkit';
import { supabase } from '../index';

export class PdfService {
  static async generateSubmissionPdf(data: {
    answers: any,
    experimentState: any,
    meta: any
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add content to PDF
      doc.fontSize(20).text('Experiment Submission', { align: 'center' });
      doc.moveDown();

      doc.fontSize(16).text(`Experiment Title: ${data.meta.metadata.title}`);
      doc.fontSize(16).text('Student Information');
      doc.fontSize(12).text(`Name: ${data.meta.student.name}`);
      doc.moveDown();

      // Experiment Instructions
      doc.fontSize(16).text('Experiment Objectives');
      data.meta.metadata.objectives.forEach((obj: any, index: number) => {
        doc.fontSize(12).text(`${index+1} : ${obj}`);
        doc.moveDown();
      });
      doc.moveDown();

      // Task Description
      doc.fontSize(16).text('Tasks');
      data.meta.metadata.tasks.forEach((task: any, index: number) => {
        doc.fontSize(12).text(`${index+1} : ${task}`);
        doc.moveDown();
      });
      doc.moveDown();

      // Post Experiment Questions & Answers
      doc.fontSize(16).text('Post Experiment Questions & Answers');
      data.answers.forEach((qa: any, index: number) => {
        doc.fontSize(12).text(`Q${index + 1}: ${qa.questionText}`);
        doc.fontSize(12).text(`A: ${qa.answerText}`);
        doc.moveDown();
      });

      // Experiment State
      doc.fontSize(16).text('Experiment State');
      doc.fontSize(12).text(JSON.stringify(data.experimentState, null, 2));

      doc.end();
    });
  }

  static async saveSubmission(studentId: string, experimentId: string, pdfBuffer: Buffer): Promise<string> {
    const filename = `${studentId}_${experimentId}_${Date.now()}.pdf`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('experiment-submissions')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('experiment-submissions')
      .getPublicUrl(filename);

    return publicUrl;
  }

  static async getSubmission(pdfUrl: string): Promise<Buffer> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }
    return Buffer.from(await response.arrayBuffer());
  }
}
