// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract AttendanceSystem {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // ================= STRUCTS =================
    struct Student {
        string name;
        uint sem;
        address wallet;
        bool exists;
    }

    struct Faculty {
        address wallet;
        bool exists;
    }

    struct Attendance {
        address student;
        string subject;
        bool present;
        uint timestamp;
        address markedBy;
    }

    // ================= MAPPINGS =================
    mapping(address => Student) public students;
    mapping(address => Faculty) public faculties;

    Attendance[] private attendanceRecords;

    // for fast lookup (IMPORTANT FIX)
    mapping(address => uint[]) private studentAttendanceIndex;

    // ================= EVENTS =================
    event StudentAdded(address indexed student, string name);
    event FacultyAdded(address indexed faculty);
    event AttendanceMarked(
        address indexed student,
        string subject,
        bool present,
        address markedBy
    );

    // ================= MODIFIERS =================
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    modifier onlyFaculty() {
        require(faculties[msg.sender].exists, "Only faculty allowed");
        _;
    }

    // ================= ADMIN =================

    function addStudent(
        string memory _name,
        uint _sem,
        address _wallet
    ) public onlyAdmin {

        require(!students[_wallet].exists, "Student already exists");

        students[_wallet] = Student(_name, _sem, _wallet, true);

        emit StudentAdded(_wallet, _name);
    }

    function addFaculty(address _wallet) public onlyAdmin {
        require(!faculties[_wallet].exists, "Faculty already exists");

        faculties[_wallet] = Faculty(_wallet, true);

        emit FacultyAdded(_wallet);
    }

    // ================= ATTENDANCE =================

    function markAttendance(
        address _student,
        string memory _subject,
        bool _present
    ) public onlyFaculty {

        require(students[_student].exists, "Student not found");

        attendanceRecords.push(
            Attendance(
                _student,
                _subject,
                _present,
                block.timestamp,
                msg.sender
            )
        );

        // store index for fast student lookup
        studentAttendanceIndex[_student].push(attendanceRecords.length - 1);

        emit AttendanceMarked(_student, _subject, _present, msg.sender);
    }

    // ================= VIEW ALL =================

    function getAttendanceCount() public view returns (uint) {
        return attendanceRecords.length;
    }

    function getAttendance(uint index) public view returns (
        address student,
        string memory subject,
        bool present,
        uint timestamp,
        address markedBy
    ) {
        Attendance memory a = attendanceRecords[index];
        return (a.student, a.subject, a.present, a.timestamp, a.markedBy);
    }

    // ================= NEW (IMPORTANT FIX) =================

    // Get attendance of ONE student (VERY IMPORTANT for frontend)
    function getStudentAttendance(address _student)
        public
        view
        returns (Attendance[] memory)
    {
        uint[] memory indexes = studentAttendanceIndex[_student];

        Attendance[] memory result = new Attendance[](indexes.length);

        for (uint i = 0; i < indexes.length; i++) {
            result[i] = attendanceRecords[indexes[i]];
        }

        return result;
    }

    // Check student exists
    function isStudent(address _wallet) public view returns (bool) {
        return students[_wallet].exists;
    }

    // Check faculty exists
    function isFaculty(address _wallet) public view returns (bool) {
        return faculties[_wallet].exists;
    }
}