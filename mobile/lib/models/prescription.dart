class Prescription {
  final String id;
  final String doctorName;
  final String patientName;
  final String date;
  final String? diagnosis;
  final List<PrescriptionItem> medicines;
  Prescription({required this.id, required this.doctorName, required this.patientName, required this.date, this.diagnosis, required this.medicines});
  factory Prescription.fromJson(Map<String, dynamic> json) => Prescription(
    id: json['_id'] ?? '', doctorName: json['doctor']?['user']?['name'] ?? 'Doctor',
    patientName: json['patient']?['user']?['name'] ?? 'Patient', date: json['createdAt'] ?? '',
    diagnosis: json['diagnosis'], medicines: json['medicines'] != null ? (json['medicines'] as List).map((e) => PrescriptionItem.fromJson(e)).toList() : [],
  );
}
class PrescriptionItem {
  final String name; final String dosage; final String frequency; final String duration;
  PrescriptionItem({required this.name, required this.dosage, required this.frequency, required this.duration});
  factory PrescriptionItem.fromJson(Map<String, dynamic> json) => PrescriptionItem(
    name: json['name'] ?? '', dosage: json['dosage'] ?? '', frequency: json['frequency'] ?? '', duration: json['duration'] ?? '',
  );
}
