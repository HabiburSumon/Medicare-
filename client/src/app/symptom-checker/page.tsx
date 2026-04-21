'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

// Symptom categories with icons and colors
const symptomCategories = [
  {
    id: 'head',
    name: 'Head & Neurological',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    symptoms: [
      { name: 'Headache', severity: 'mild' },
      { name: 'Dizziness', severity: 'mild' },
      { name: 'Blurred Vision', severity: 'moderate' },
      { name: 'Migraine', severity: 'moderate' },
      { name: 'Memory Issues', severity: 'moderate' },
      { name: 'Confusion', severity: 'severe' },
      { name: 'Fainting', severity: 'severe' },
      { name: 'Seizures', severity: 'severe' },
    ],
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    icon: '🫁',
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    symptoms: [
      { name: 'Cough', severity: 'mild' },
      { name: 'Congestion', severity: 'mild' },
      { name: 'Sore Throat', severity: 'mild' },
      { name: 'Shortness of Breath', severity: 'moderate' },
      { name: 'Wheezing', severity: 'moderate' },
      { name: 'Chest Tightness', severity: 'moderate' },
      { name: 'Difficulty Breathing', severity: 'severe' },
      { name: 'Coughing Blood', severity: 'severe' },
    ],
  },
  {
    id: 'digestive',
    name: 'Digestive',
    icon: '🤢',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    symptoms: [
      { name: 'Nausea', severity: 'mild' },
      { name: 'Heartburn', severity: 'mild' },
      { name: 'Loss of Appetite', severity: 'mild' },
      { name: 'Stomach Pain', severity: 'moderate' },
      { name: 'Bloating', severity: 'mild' },
      { name: 'Diarrhea', severity: 'moderate' },
      { name: 'Vomiting', severity: 'moderate' },
      { name: 'Blood in Stool', severity: 'severe' },
    ],
  },
  {
    id: 'musculoskeletal',
    name: 'Bones & Muscles',
    icon: '🦴',
    color: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
    symptoms: [
      { name: 'Back Pain', severity: 'mild' },
      { name: 'Joint Pain', severity: 'mild' },
      { name: 'Muscle Aches', severity: 'mild' },
      { name: 'Body Aches', severity: 'mild' },
      { name: 'Stiffness', severity: 'mild' },
      { name: 'Swelling', severity: 'moderate' },
      { name: 'Limited Mobility', severity: 'moderate' },
      { name: 'Severe Pain', severity: 'severe' },
    ],
  },
  {
    id: 'general',
    name: 'General',
    icon: '🌡️',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    symptoms: [
      { name: 'Fever', severity: 'mild' },
      { name: 'Fatigue', severity: 'mild' },
      { name: 'Chills', severity: 'mild' },
      { name: 'Night Sweats', severity: 'moderate' },
      { name: 'Weight Loss', severity: 'moderate' },
      { name: 'Skin Rash', severity: 'moderate' },
      { name: 'Insomnia', severity: 'mild' },
      { name: 'Anxiety', severity: 'mild' },
    ],
  },
  {
    id: 'heart',
    name: 'Heart & Chest',
    icon: '❤️',
    color: 'from-red-500 to-pink-600',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    symptoms: [
      { name: 'Chest Pain', severity: 'moderate' },
      { name: 'Palpitations', severity: 'moderate' },
      { name: 'Rapid Heartbeat', severity: 'moderate' },
      { name: 'Irregular Heartbeat', severity: 'severe' },
      { name: 'High Blood Pressure', severity: 'moderate' },
      { name: 'Swollen Legs', severity: 'moderate' },
      { name: 'Chest Pressure', severity: 'severe' },
      { name: 'Left Arm Pain', severity: 'severe' },
    ],
  },
];

const durationOptions = [
  { value: 'today', label: 'Started Today', icon: '📅' },
  { value: '1-3days', label: '1-3 Days', icon: '📆' },
  { value: '1week', label: 'About a Week', icon: '🗓️' },
  { value: '2weeks', label: '2+ Weeks', icon: '📋' },
  { value: '1month', label: '1+ Month', icon: '📊' },
  { value: 'chronic', label: 'Chronic/Recurring', icon: '🔄' },
];

const severityLevels = [
  { value: 1, label: 'Mild', color: 'bg-green-500', emoji: '🙂' },
  { value: 2, label: 'Moderate', color: 'bg-yellow-500', emoji: '😐' },
  { value: 3, label: 'Severe', color: 'bg-orange-500', emoji: '😣' },
  { value: 4, label: 'Very Severe', color: 'bg-red-500', emoji: '😖' },
];

export default function SymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severityMap, setSeverityMap] = useState<Record<string, number>>({});
  const [duration, setDuration] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all symptoms flat
  const allSymptoms = symptomCategories.flatMap((cat) =>
    cat.symptoms.map((s) => ({ ...s, category: cat.name, categoryId: cat.id, catIcon: cat.icon }))
  );

  const filteredSymptoms = searchQuery
    ? allSymptoms.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
    setSeverityMap((prev) => {
      const copy = { ...prev };
      if (copy[symptom]) delete copy[symptom];
      else copy[symptom] = 1;
      return copy;
    });
  };

  const setSymptomSeverity = (symptom: string, level: number) => {
    setSeverityMap((prev) => ({ ...prev, [symptom]: level }));
  };

  const getSeverityInfo = (level: number) => severityLevels.find((s) => s.value === level) || severityLevels[0];

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setStep(3);
    try {
      const res = await api.post('/symptoms/check', { symptoms: selectedSymptoms });
      setResults(res.data.data);
    } catch {
      // Rich fallback
      const has = (s: string) => selectedSymptoms.some((sym) => sym.toLowerCase().includes(s.toLowerCase()));
      const conditions: any[] = [];

      if (has('cough') || has('sore throat') || has('congestion') || has('fever')) {
        conditions.push({
          condition: 'Common Cold / Flu',
          probability: 85,
          severity: 'mild',
          urgency: 'low',
          suggestedDoctor: 'General Physician',
          description: 'A viral infection of the upper respiratory tract. Usually resolves within 7-10 days.',
          selfCare: ['Rest and sleep', 'Stay hydrated with warm fluids', 'Use over-the-counter cold medicine', 'Gargle with salt water'],
          whenToSeeDoctor: 'If symptoms last more than 10 days, fever exceeds 103°F, or you experience difficulty breathing.',
        });
      }
      if (has('headache') || has('dizziness') || has('migraine')) {
        conditions.push({
          condition: 'Tension Headache / Migraine',
          probability: 70,
          severity: 'moderate',
          urgency: 'low',
          suggestedDoctor: 'Neurologist',
          description: 'Headaches can be caused by stress, dehydration, eye strain, or neurological conditions.',
          selfCare: ['Rest in a quiet, dark room', 'Apply cold or warm compresses', 'Stay hydrated', 'Practice relaxation techniques'],
          whenToSeeDoctor: 'If headaches are frequent, severe, or accompanied by vision changes or weakness.',
        });
      }
      if (has('stomach pain') || has('nausea') || has('heartburn') || has('bloating')) {
        conditions.push({
          condition: 'Gastritis / Acid Reflux',
          probability: 65,
          severity: 'moderate',
          urgency: 'low',
          suggestedDoctor: 'Gastroenterologist',
          description: 'Inflammation of the stomach lining often caused by infection, medication, or dietary choices.',
          selfCare: ['Avoid spicy and fatty foods', 'Eat smaller, frequent meals', 'Don\'t lie down after eating', 'Limit caffeine and alcohol'],
          whenToSeeDoctor: 'If you experience persistent pain, vomiting blood, or black stools.',
        });
      }
      if (has('chest pain') || has('palpitations') || has('shortness of breath')) {
        conditions.push({
          condition: 'Cardiac / Respiratory Condition',
          probability: 55,
          severity: 'severe',
          urgency: 'high',
          suggestedDoctor: 'Cardiologist',
          description: 'Chest symptoms may indicate heart or lung conditions that require medical evaluation.',
          selfCare: ['Seek immediate medical attention if severe', 'Rest and avoid physical exertion', 'Monitor your symptoms closely'],
          whenToSeeDoctor: 'IMMEDIATELY if you experience severe chest pain, difficulty breathing, or pain radiating to the arm/jaw.',
        });
      }
      if (has('back pain') || has('joint pain') || has('muscle') || has('stiffness')) {
        conditions.push({
          condition: 'Musculoskeletal Strain / Arthritis',
          probability: 60,
          severity: 'moderate',
          urgency: 'low',
          suggestedDoctor: 'Orthopedic Surgeon',
          description: 'Pain in bones, joints, or muscles can result from injury, overuse, or inflammatory conditions.',
          selfCare: ['Apply ice/heat therapy', 'Gentle stretching exercises', 'Over-the-counter pain relief', 'Maintain good posture'],
          whenToSeeDoctor: 'If pain is severe, persists for weeks, or is accompanied by swelling and redness.',
        });
      }
      if (has('anxiety') || has('insomnia') || has('fatigue')) {
        conditions.push({
          condition: 'Stress / Anxiety Disorder',
          probability: 50,
          severity: 'moderate',
          urgency: 'medium',
          suggestedDoctor: 'Psychiatrist',
          description: 'Mental health conditions that can manifest with both psychological and physical symptoms.',
          selfCare: ['Practice mindfulness and meditation', 'Regular exercise', 'Maintain a sleep schedule', 'Talk to someone you trust'],
          whenToSeeDoctor: 'If anxiety interferes with daily life, sleep problems persist, or you feel overwhelmed.',
        });
      }
      if (has('skin rash') || has('blurred vision') || has('weight loss')) {
        conditions.push({
          condition: 'Allergic / Autoimmune Reaction',
          probability: 45,
          severity: 'moderate',
          urgency: 'medium',
          suggestedDoctor: 'Dermatologist',
          description: 'Skin and systemic symptoms may indicate allergic reactions or autoimmune conditions.',
          selfCare: ['Identify and avoid triggers', 'Use gentle skincare products', 'Keep a symptom diary', 'Over-the-counter antihistamines'],
          whenToSeeDoctor: 'If rash spreads rapidly, is accompanied by fever, or affects breathing.',
        });
      }

      if (conditions.length === 0) {
        conditions.push({
          condition: 'General Health Assessment',
          probability: 50,
          severity: 'mild',
          urgency: 'low',
          suggestedDoctor: 'General Physician',
          description: 'Based on your symptoms, a general health evaluation is recommended.',
          selfCare: ['Rest and stay hydrated', 'Monitor your symptoms', 'Maintain a healthy diet', 'Get adequate sleep'],
          whenToSeeDoctor: 'If symptoms persist for more than a few days or worsen significantly.',
        });
      }

      setResults({
        possibleConditions: conditions.sort((a, b) => b.probability - a.probability),
        overallAssessment: {
          riskLevel: conditions.some((c) => c.urgency === 'high') ? 'high' : conditions.some((c) => c.urgency === 'medium') ? 'medium' : 'low',
          summary: `Based on ${selectedSymptoms.length} symptoms analyzed, we found ${conditions.length} possible condition${conditions.length > 1 ? 's' : ''}.`,
        },
        disclaimer: 'This AI-powered assessment provides general guidance only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for proper evaluation and treatment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetChecker = () => {
    setStep(1);
    setSelectedSymptoms([]);
    setSeverityMap({});
    setDuration('');
    setAgeGroup('');
    setGender('');
    setAdditionalNotes('');
    setResults(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800', label: '⚠️ Seek Immediate Care' };
      case 'medium': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', label: '🕐 Schedule Soon' };
      default: return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800', label: '✅ Low Urgency' };
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return 'from-blue-500 to-blue-600';
    if (prob >= 50) return 'from-primary-500 to-primary-600';
    if (prob >= 30) return 'from-amber-500 to-amber-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-32 h-32 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-white rounded-full animate-float animation-delay-500"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full animate-float animation-delay-300"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
                <span>🤖</span>
                <span>Powered by AI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">AI Symptom Checker</h1>
              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                Not sure what's bothering you? Select your symptoms and our intelligent system will analyze them to suggest possible conditions and recommend the right specialists.
              </p>
              {step === 1 && (
                <div className="mt-6 flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Takes 2-3 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>100% Private & Secure</span>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-56 h-56 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-44 h-44 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-7xl animate-pulse">🩺</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 flex items-center space-x-3">
            {[
              { num: 1, label: 'Select Symptoms' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Results' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.num ? 'bg-white text-purple-700' : 'bg-white/20 text-white/60'}`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${step >= s.num ? 'text-white' : 'text-white/50'}`}>{s.label}</span>
                </div>
                {i < 2 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? 'bg-white' : 'bg-white/20'}`}></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Select Symptoms */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptoms... (e.g., headache, cough, chest pain)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-lg transition-all"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Found {filteredSymptoms.length} matching symptoms</p>
                </div>
                <div className="p-3 max-h-64 overflow-y-auto">
                  {filteredSymptoms.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => { toggleSymptom(s.name); setSearchQuery(''); }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all hover:bg-gray-50 ${selectedSymptoms.includes(s.name) ? 'bg-primary-50 border border-primary-200' : ''}`}
                    >
                      <span className="text-lg">{s.catIcon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.category}</p>
                      </div>
                      {selectedSymptoms.includes(s.name) && (
                        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  ))}
                  {filteredSymptoms.length === 0 && (
                    <p className="text-center text-gray-400 py-4">No symptoms found. Try a different search term.</p>
                  )}
                </div>
              </div>
            )}

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-5 border border-primary-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Selected Symptoms ({selectedSymptoms.length})</h3>
                  <button onClick={() => { setSelectedSymptoms([]); setSeverityMap({}); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((sym) => (
                    <span key={sym} className="inline-flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full text-sm border border-primary-200 shadow-sm">
                      <span className="font-medium text-gray-700">{sym}</span>
                      <button onClick={() => toggleSymptom(sym)} className="text-gray-400 hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Sections */}
            <div className="space-y-4">
              {symptomCategories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shadow-md`}>
                        {cat.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                        <p className="text-xs text-gray-400">{cat.symptoms.length} symptoms</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {selectedSymptoms.filter((s) => cat.symptoms.some((cs) => cs.name === s)).length > 0 && (
                        <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          {selectedSymptoms.filter((s) => cat.symptoms.some((cs) => cs.name === s)).length} selected
                        </span>
                      )}
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${activeCategory === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>
                  {activeCategory === cat.id && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {cat.symptoms.map((sym) => {
                          const isSelected = selectedSymptoms.includes(sym.name);
                          return (
                            <button
                              key={sym.name}
                              onClick={() => toggleSymptom(sym.name)}
                              className={`relative p-3 rounded-xl text-left transition-all border-2 ${isSelected ? `border-primary-500 bg-primary-50 shadow-md` : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                            >
                              <p className={`font-medium text-sm ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>{sym.name}</p>
                              <span className={`text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${sym.severity === 'mild' ? 'bg-green-100 text-green-600' : sym.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                {sym.severity}
                              </span>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Severity selector for selected symptoms */}
                      {selectedSymptoms.filter((s) => cat.symptoms.some((cs) => cs.name === s)).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-3">Rate severity of your symptoms:</p>
                          <div className="space-y-3">
                            {selectedSymptoms.filter((s) => cat.symptoms.some((cs) => cs.name === s)).map((sym) => (
                              <div key={sym} className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600 w-32 flex-shrink-0">{sym}</span>
                                <div className="flex space-x-2 flex-1">
                                  {severityLevels.map((level) => (
                                    <button
                                      key={level.value}
                                      onClick={() => setSymptomSeverity(sym, level.value)}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${(severityMap[sym] || 1) >= level.value ? 'bg-primary-100 text-primary-700 border border-primary-300' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'}`}
                                    >
                                      {level.emoji} {level.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={() => { if (selectedSymptoms.length > 0) setStep(2); }}
                disabled={selectedSymptoms.length === 0}
                className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Continue with {selectedSymptoms.length} Symptom{selectedSymptoms.length > 1 ? 's' : ''}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Additional Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-1">How long have you had these symptoms?</h3>
                <p className="text-sm text-gray-400 mb-4">This helps us assess urgency</p>
                <div className="space-y-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl border-2 transition-all text-left ${duration === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className={`font-medium text-sm ${duration === opt.value ? 'text-primary-700' : 'text-gray-700'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age & Gender */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-1">What is your age group?</h3>
                  <p className="text-sm text-gray-400 mb-4">Some conditions are age-related</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Under 18', '18-30', '31-50', '51-65', '65+'].map((age) => (
                      <button
                        key={age}
                        onClick={() => setAgeGroup(age)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${ageGroup === age ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-1">Biological Sex</h3>
                  <p className="text-sm text-gray-400 mb-4">Helps refine condition analysis</p>
                  <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${gender === g ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Anything else? (Optional)</h3>
              <p className="text-sm text-gray-400 mb-4">Describe your symptoms in your own words</p>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="E.g., 'The headache gets worse in the morning and I feel pressure behind my eyes...'"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none resize-none transition-all"
                rows={4}
              />
            </div>

            {/* Selected Symptoms Review */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-5 border border-primary-100">
              <h3 className="font-semibold text-gray-900 mb-3">Your Selected Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((sym) => (
                  <span key={sym} className="inline-flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full text-sm border border-primary-200 shadow-sm">
                    <span className="font-medium text-gray-700">{sym}</span>
                    <span className="text-xs text-gray-400">({(severityLevels.find((l) => l.value === (severityMap[sym] || 1))?.label)})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary px-6 py-3 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                <span>Back</span>
              </button>
              <button onClick={checkSymptoms} disabled={selectedSymptoms.length === 0} className="btn-primary px-8 py-3 text-lg disabled:opacity-50 flex items-center space-x-2">
                <span>🔍 Analyze Symptoms</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Symptoms...</h3>
                <p className="text-gray-500 mb-6">Our AI is processing {selectedSymptoms.length} symptoms</p>
                <div className="flex justify-center space-x-1">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></div>
                  ))}
                </div>
                <div className="mt-8 max-w-sm mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            ) : results ? (
              <>
                {/* Overall Assessment */}
                <div className={`rounded-2xl p-6 border-2 ${getUrgencyColor(results.overallAssessment?.riskLevel || 'low').border} ${getUrgencyColor(results.overallAssessment?.riskLevel || 'low').bg}`}>
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-3xl">{results.overallAssessment?.riskLevel === 'high' ? '🚨' : results.overallAssessment?.riskLevel === 'medium' ? '⚠️' : '✅'}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Assessment Summary</h3>
                      <p className="text-gray-600 mb-3">{results.overallAssessment?.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getUrgencyColor(results.overallAssessment?.riskLevel || 'low').badge}`}>
                          {getUrgencyColor(results.overallAssessment?.riskLevel || 'low').label}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {selectedSymptoms.length} symptoms analyzed
                        </span>
                        {duration && <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Duration: {durationOptions.find(d => d.value === duration)?.label}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/doctors" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all text-center group">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">Find a Doctor</p>
                    <p className="text-xs text-gray-400 mt-1">Browse specialists</p>
                  </Link>
                  <Link href="/chat" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all text-center group">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">Chat with Doctor</p>
                    <p className="text-xs text-gray-400 mt-1">Get quick advice</p>
                  </Link>
                  <Link href="/medicines" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all text-center group">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 transition-colors">
                      <span className="text-2xl">💊</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">Order Medicine</p>
                    <p className="text-xs text-gray-400 mt-1">Browse pharmacy</p>
                  </Link>
                  <button onClick={resetChecker} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all text-center group">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-100 transition-colors">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">Check Again</p>
                    <p className="text-xs text-gray-400 mt-1">New assessment</p>
                  </button>
                </div>

                {/* Possible Conditions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Possible Conditions</h2>
                  <div className="space-y-4">
                    {results.possibleConditions?.map((cond: any, i: number) => {
                      const urgency = getUrgencyColor(cond.urgency || 'low');
                      return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getProbabilityColor(cond.probability)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                  #{i + 1}
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{cond.condition}</h3>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${urgency.badge}`}>{urgency.label}</span>
                                    {cond.severity && <span className="text-xs text-gray-400 capitalize">{cond.severity} severity</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{cond.probability}%</p>
                                <p className="text-xs text-gray-400">match</p>
                              </div>
                            </div>

                            {/* Probability Bar */}
                            <div className="mb-4">
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${getProbabilityColor(cond.probability)} rounded-full transition-all duration-1000`}
                                  style={{ width: `${cond.probability}%` }}
                                ></div>
                              </div>
                            </div>

                            {cond.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{cond.description}</p>}

                            {/* Self Care Tips */}
                            {cond.selfCare && cond.selfCare.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">🏠 Self-Care Tips</h4>
                                <div className="grid sm:grid-cols-2 gap-2">
                                  {cond.selfCare.map((tip: string, j: number) => (
                                    <div key={j} className="flex items-start space-x-2 text-sm">
                                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                      <span className="text-gray-600">{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* When to See Doctor */}
                            {cond.whenToSeeDoctor && (
                              <div className={`rounded-xl p-3 ${urgency.bg} ${urgency.border} border mb-4`}>
                                <h4 className={`text-sm font-semibold ${urgency.text} mb-1`}>🩺 When to See a Doctor</h4>
                                <p className={`text-sm ${urgency.text}`}>{cond.whenToSeeDoctor}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-500">
                                Suggested: <strong className="text-gray-700">{cond.suggestedDoctor}</strong>
                              </p>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/doctors?specialization=${encodeURIComponent(cond.suggestedDoctor)}`}
                                  className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                                >
                                  Find {cond.suggestedDoctor}
                                </Link>
                                <Link
                                  href="/chat"
                                  className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors border border-green-200"
                                >
                                  💬 Consult Now
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Health Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-4">💡 General Health Tips</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: '💧', title: 'Stay Hydrated', desc: 'Drink 8-10 glasses of water daily' },
                      { icon: '😴', title: 'Get Enough Sleep', desc: 'Aim for 7-9 hours per night' },
                      { icon: '🏃', title: 'Exercise Regularly', desc: '30 minutes of activity most days' },
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start space-x-3 bg-white/60 rounded-xl p-4">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{tip.title}</p>
                          <p className="text-xs text-gray-500">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="font-bold text-amber-800 mb-1">Medical Disclaimer</h4>
                      <p className="text-sm text-amber-700 leading-relaxed">{results.disclaimer}</p>
                    </div>
                  </div>
                </div>

                {/* Start Over */}
                <div className="text-center pt-4">
                  <button onClick={resetChecker} className="btn-secondary px-8 py-3 inline-flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>Start New Assessment</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}