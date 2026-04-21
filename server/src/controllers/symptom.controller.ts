import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface SymptomRule {
  symptoms: string[];
  possibleConditions: string[];
  suggestedSpecializations: string[];
  severity: 'low' | 'medium' | 'high';
  advice: string;
}

const symptomDatabase: SymptomRule[] = [
  {
    symptoms: ['headache', 'fever', 'body ache', 'fatigue'],
    possibleConditions: ['Common Cold', 'Flu (Influenza)', 'Viral Infection'],
    suggestedSpecializations: ['General Physician', 'Internal Medicine'],
    severity: 'low',
    advice: 'Rest, stay hydrated, and take over-the-counter pain relievers. Consult a doctor if symptoms persist.',
  },
  {
    symptoms: ['chest pain', 'shortness of breath', 'dizziness', 'palpitation'],
    possibleConditions: ['Heart-related condition', 'Anxiety/Panic attack', 'Acid reflux'],
    suggestedSpecializations: ['Cardiologist', 'General Physician'],
    severity: 'high',
    advice: 'Seek immediate medical attention if chest pain is severe. Call emergency services.',
  },
  {
    symptoms: ['skin rash', 'itching', 'redness', 'swelling'],
    possibleConditions: ['Allergic reaction', 'Eczema', 'Contact Dermatitis', 'Psoriasis'],
    suggestedSpecializations: ['Dermatologist', 'Allergist'],
    severity: 'low',
    advice: 'Avoid scratching, apply moisturizer. Consult a dermatologist for proper diagnosis.',
  },
  {
    symptoms: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'bloating'],
    possibleConditions: ['Gastroenteritis', 'Food Poisoning', 'IBS', 'Gastric Ulcer'],
    suggestedSpecializations: ['Gastroenterologist', 'General Physician'],
    severity: 'medium',
    advice: 'Stay hydrated, eat bland foods. Seek medical help if symptoms are severe or persistent.',
  },
  {
    symptoms: ['cough', 'sore throat', 'runny nose', 'congestion', 'sneezing'],
    possibleConditions: ['Common Cold', 'Allergic Rhinitis', 'Sinusitis', 'Bronchitis'],
    suggestedSpecializations: ['ENT Specialist', 'General Physician', 'Pulmonologist'],
    severity: 'low',
    advice: 'Rest, warm fluids, and over-the-counter cold medications. See a doctor if cough persists.',
  },
  {
    symptoms: ['back pain', 'joint pain', 'stiffness', 'swelling joints'],
    possibleConditions: ['Arthritis', 'Muscle Strain', 'Sciatica', 'Osteoporosis'],
    suggestedSpecializations: ['Orthopedic', 'Rheumatologist'],
    severity: 'medium',
    advice: 'Rest, apply hot/cold compress. Consult specialist for chronic pain.',
  },
  {
    symptoms: ['anxiety', 'depression', 'insomnia', 'mood swings', 'stress'],
    possibleConditions: ['Anxiety Disorder', 'Depression', 'Stress-related condition'],
    suggestedSpecializations: ['Psychiatrist', 'Psychologist', 'Counselor'],
    severity: 'medium',
    advice: 'Talk to someone you trust. Professional help is recommended for persistent symptoms.',
  },
  {
    symptoms: ['blurred vision', 'eye pain', 'red eyes', 'headache'],
    possibleConditions: ['Eye Strain', 'Conjunctivitis', 'Glaucoma', 'Migraine'],
    suggestedSpecializations: ['Ophthalmologist', 'Neurologist'],
    severity: 'medium',
    advice: 'Rest your eyes, reduce screen time. See an eye specialist promptly.',
  },
  {
    symptoms: ['frequent urination', 'thirst', 'fatigue', 'weight loss'],
    possibleConditions: ['Diabetes', 'Urinary Tract Infection', 'Thyroid Disorder'],
    suggestedSpecializations: ['Endocrinologist', 'General Physician', 'Urologist'],
    severity: 'medium',
    advice: 'Get blood sugar and thyroid levels checked. Consult a doctor.',
  },
  {
    symptoms: ['breathing difficulty', 'wheezing', 'chronic cough', 'chest tightness'],
    possibleConditions: ['Asthma', 'COPD', 'Pneumonia', 'Bronchitis'],
    suggestedSpecializations: ['Pulmonologist', 'General Physician'],
    severity: 'high',
    advice: 'Seek immediate medical attention for severe breathing difficulty.',
  },
];

export const analyzeSymptoms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide symptoms array' });
      return;
    }

    const normalizedSymptoms = symptoms.map((s: string) => s.toLowerCase().trim());

    // Score each condition based on symptom matches
    const results = symptomDatabase.map((rule) => {
      const matchCount = normalizedSymptoms.filter((s: string) =>
        rule.symptoms.some((rs) => rs.includes(s) || s.includes(rs))
      ).length;
      const matchPercentage = (matchCount / rule.symptoms.length) * 100;
      return { ...rule, matchPercentage: Math.round(matchPercentage) };
    }).filter((r) => r.matchPercentage > 0).sort((a, b) => b.matchPercentage - a.matchPercentage);

    const disclaimer = '⚠️ This symptom checker provides general guidance only and does NOT replace professional medical diagnosis. Please consult a qualified healthcare provider for accurate diagnosis and treatment.';

    res.json({
      success: true,
      data: {
        results: results.slice(0, 3),
        disclaimer,
        inputSymptoms: normalizedSymptoms,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};