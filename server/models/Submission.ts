import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    experimentId: { type: String, required: true },
    pdfData: { type: Buffer, required: true },
    experimentState: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String }
  },
  { timestamps: true }
);

submissionSchema.index({ studentId: 1, experimentId: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
