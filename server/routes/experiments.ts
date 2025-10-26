import { Router } from "express";
import { supabase } from "../index";
import { PdfService } from "../services/PdfService";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("experiments").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.get("/slug/:slug", async (req, res) => {
  const { slug } = req.params;

  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// router.post("/generatePdf", async (req, res) => {
//   try {
//     const { answers, experimentState, meta } = req.body;

//     const pdfBuffer = await PdfService.generateSubmissionPdf({
//       answers,
//       experimentState,
//       meta,
//     });

//     await PdfService.saveSubmission(
//       meta.student.id,
//       meta.metadata.experimentData.id,
//       pdfBuffer,
//       experimentState
//     );

//     res.status(200).json({ message: "Submission saved successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to generate submission" });
//   }
// });

router.post("/submit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, experimentState, meta } = req.body;
    const userId = (req as any).user.id;

    // Generate PDF
    const pdfBuffer = await PdfService.generateSubmissionPdf({
      answers,
      experimentState,
      meta,
    });

    // Upload to storage and get URL
    const pdfUrl = await PdfService.saveSubmission(
      meta.student.id,
      meta.metadata.experimentId,
      pdfBuffer
    );

    // Save submission with PDF URL
    const { data, error } = await supabase.from("submissions").insert([
      {
        experiment_id: id,
        user_id: userId,
        answers,
        experiment_state: experimentState,
        submitted_at: new Date(),
        pdf_url: pdfUrl,
      },
    ]);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/submission/:submissionId", async (req, res) => {
  try {
    const { data: submission, error } = await supabase
      .from("submissions")
      .select("pdf_url")
      .eq("id", req.params.submissionId)
      .single();

    if (error || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const pdfBuffer = await PdfService.getSubmission(submission.pdf_url);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve submission" });
  }
});

export const experimentsRouter = router;
