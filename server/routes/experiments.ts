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

router.post("/grade/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const { data, error } = await supabase
      .from("submissions")
      .update({ grade: score, feedback, graded_at: new Date() })
      .eq("id", submissionId);

    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to grade submission" });
  }
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

// router.post("/submit/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { answers, experimentState, meta } = req.body;
//     const userId = (req as any).user.id;

//     // Generate PDF
//     const pdfBuffer = await PdfService.generateSubmissionPdf({
//       answers,
//       experimentState,
//       meta,
//     });

//     // Upload to storage and get URL
//     const pdfUrl = await PdfService.saveSubmission(
//       meta.student.id,
//       meta.metadata.experimentId,
//       pdfBuffer
//     );

//     // Save submission with PDF URL
//     const { data, error } = await supabase.from("submissions").insert([
//       {
//         experiment_id: id,
//         user_id: userId,
//         answers,
//         experiment_state: experimentState,
//         submitted_at: new Date(),
//         pdf_url: pdfUrl,
//       },
//     ]);

//     if (error) {
//       throw error;
//     }

//     res.json(data);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
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

    // 1️⃣ Check if an earlier submission exists
    const { data: existing, error: existingError } = await supabase
      .from("submissions")
      .select("*")
      .eq("experiment_id", id)
      .eq("user_id", userId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    // 2️⃣ If exists → delete old PDF
    if (existing?.pdf_url) {
      try {
        const oldUrl = existing.pdf_url;

        // Convert full URL → storage file path
        // Example:
        // "https://xyz.supabase.co/storage/v1/object/public/submissions/user123/exp456/file.pdf"
        const path = oldUrl.split("/object/public/")[1]; // "submissions/user123/exp456/file.pdf"

        const { error: deleteErr } = await supabase.storage
          .from("submissions") // your bucket name
          .remove([path.replace("submissions/", "")]);

        if (deleteErr) {
          console.warn("Could not delete old PDF:", deleteErr);
        }
      } catch (err) {
        console.warn("Error extracting storage path:", err);
      }
    }

    let result;

    // 2️⃣ If exists → UPDATE it
    if (existing) {
      const { data, error } = await supabase
        .from("submissions")
        .update({
          answers,
          experiment_state: experimentState,
          submitted_at: new Date(),
          pdf_url: pdfUrl,
        })
        .eq("id", existing.id)
        .select();

      if (error) throw error;
      result = data;
    }

    // 3️⃣ If does NOT exist → INSERT new
    else {
      const { data, error } = await supabase
        .from("submissions")
        .insert([
          {
            experiment_id: id,
            user_id: userId,
            answers,
            experiment_state: experimentState,
            submitted_at: new Date(),
            pdf_url: pdfUrl,
          },
        ])
        .select();

      if (error) throw error;
      result = data;
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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

router.get("/submissions/:studentId", async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,experiment_id,grade,feedback,submitted_at,pdf_url,
      experiment_name:experiment_id (
        title
      )
    `
    )
    .eq("user_id", studentId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export const experimentsRouter = router;
