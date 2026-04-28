class Appointment {
  final String id;
  final String doctorId;
  final String doctorName;
  final String patientId;
  final String date;
  final String time;
  final String status;
  final String? notes;
  final double? fee;
  final String? serialNumber;
  Appointment({required this.id, required this.doctorId, required this.doctorName, required this.patientId, required this.date, required this.time, required this.status, this.notes, this.fee, this.serialNumber});
  factory Appointment.fromJson(Map<String, dynamic> json) => Appointment(
    id: json['_id'] ?? '',
    doctorId: json['doctor']?['_id'] ?? json['doctor'] ?? '',
    doctorName: json['doctor']?['user']?['name'] ?? json['doctorName'] ?? 'Doctor',
    patientId: json['patient']?['_id'] ?? json['patient'] ?? '',
    date: json['date'] ?? '',
    time: json['timeSlot'] ?? json['time'] ?? '',
    status: json['status'] ?? 'pending',
    notes: json['notes'],
    fee: json['consultationFee']?.toDouble(),
    serialNumber: json['serialNumber'],
  );
}