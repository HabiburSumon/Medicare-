import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface SymptomRule {
  conditions: string[];
  possibleConditions: string[];
  suggestedDoctors: string[];
  severity: string;
  advice: string;
}

const symptomRules: SymptomRule[] = [
  {
    conditions: ['fever', 'headache', 'body pain', 'fatigue'],
    possibleConditions: ['Flu', 'Common Cold', 'Dengue Fever', 'Malaria'],
    suggestedDoctors: ['General Physician', 'Internal Medicine'],
    severity: 'moderate',
    advice: 'Rest, stay hydrated, and monitor your temperature. If fever persists above 103°F, seek immediate medical attention.',
  },
  {
    conditions: ['cough', 'sore throat', 'runny nose', 'congestion'],
    possibleConditions: ['Common Cold', 'Bronchitis', 'Sinusitis', 'Allergies'],
    suggestedDoctors: ['General Physician', 'ENT Specialist'],
    severity: 'mild',
    advice: 'Rest, drink warm fluids, and use over-the-counter cold medicine if needed.',
  },
  {
    conditions: ['chest pain', 'shortness of breath', 'dizziness', 'palpitation'],
    possibleConditions: ['Heart Disease', 'Anxiety', 'Acid Reflux', 'Lung Disease'],
    suggestedDoctors: ['Cardiologist', 'Pulmonologist'],
    severity: 'severe',
    advice: 'Seek immediate medical attention if chest pain is severe or accompanied by shortness of breath.',
  },
  {
    conditions: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'bloating'],
    possibleConditions: ['Gastroenteritis', 'Food Poisoning', 'IBS', 'Gastric Ulcer'],
    suggestedDoctors: ['Gastroenterologist', 'General Physician'],
    severity: 'moderate',
    advice: 'Stay hydrated, eat bland foods, and avoid spicy or oily food.',
  },
  {
    conditions: ['skin rash', 'itching', 'redness', 'swelling', 'acne'],
    possibleConditions: ['Allergic Reaction', 'Eczema', 'Psoriasis', 'Dermatitis'],
    suggestedDoctors: ['Dermatologist'],
    severity: 'mild',
    advice: 'Avoid scratching, apply moisturizer, and identify potential allergens.',
  },
  {
    conditions: ['joint pain', 'back pain', 'muscle pain', 'stiffness', 'swelling'],
    possibleConditions: ['Arthritis', 'Muscle Strain', 'Osteoporosis', 'Fibromyalgia'],
    suggestedDoctors: ['Orthopedic', 'Rheumatologist'],
    severity: 'moderate',
    advice: 'Rest the affected area, apply ice/heat, and avoid heavy lifting.',
  },
  {
    conditions: ['headache', 'migraine', 'blurred vision', 'dizziness', 'confusion'],
    possibleConditions: ['Migraine', 'Tension Headache', 'Hypertension', 'Vision Problems'],
    suggestedDoctors: ['Neurologist', 'Ophthalmologist'],
    severity: 'moderate',
    advice: 'Rest in a dark room, stay hydrated, and avoid screen time.',
  },
  {
    conditions: ['anxiety', 'depression', 'insomnia', 'mood changes', 'stress'],
    possibleConditions: ['Anxiety Disorder', 'Depression', 'Bipolar Disorder', 'Stress'],
    suggestedDoctors: ['Psychiatrist', 'Psychologist'],
    severity: 'moderate',
    advice: 'Practice relaxation techniques, maintain a routine, and talk to someone you trust.',
  },
  {
    conditions: ['frequent urination', 'blood in urine', 'kidney pain', 'swelling'],
    possibleConditions: ['UTI', 'Kidney Stones', 'Kidney Disease', 'Bladder Infection'],
    suggestedDoctors: ['Nephrologist', 'Urologist'],
    severity: 'moderate',
    advice: 'Drink plenty of water and seek medical attention if you see blood in urine.',
  },
  {
    conditions: ['weight gain', 'weight loss', 'fatigue', 'hair loss', 'hot flashes'],
    possibleConditions: ['Thyroid Disorder', 'Diabetes', 'Hormonal Imbalance'],
    suggestedDoctors: ['Endocrinologist', 'General Physician'],
    severity: 'moderate',
    advice: 'Get blood tests done and maintain a healthy diet and exercise routine.',
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
    const results: any[] = [];
    const matchedConditions = new Set<string>();
    const matchedDoctors = new Set<string>();
    let maxSeverity = 'mild';

    for (const rule of symptomRules) {
      const matchCount = rule.conditions.filter((c) =>
        normalizedSymptoms.some((s) => s.includes(c) || c.includes(s))
      ).length;

      if (matchCount > 0) {
        const score = matchCount / rule.conditions.length;
        rule.possibleConditions.forEach((c) => matchedConditions.add(c));
        rule.suggestedDoctors.forEach((d) => matchedDoctors.add(d));
        if (rule.severity === 'severe') maxSeverity = 'severe';
        else if (rule.severity === 'moderate' && maxSeverity !== 'severe') maxSeverity = 'moderate';
        results.push({ ...rule, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        symptoms: normalizedSymptoms,
        possibleConditions: Array.from(matchedConditions),
        suggestedDoctors: Array.from(matchedDoctors),
        severity: maxSeverity,
        topResults: results.slice(0, 3),
        disclaimer: 'This is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical advice and treatment.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};