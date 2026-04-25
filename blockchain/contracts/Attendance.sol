// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // ---------------- STUDENT ----------------
    struct Student {
        string name;
        uint sem;
        address wallet;
    }

    Student[] public students;

    // ---------------- FACULTY ----------------
    mapping(address => bool) public faculty;

    // ---------------- ATTENDANCE ----------------
    struct Record {
        address student;
        string subject;
        uint timestamp;
        bool present;
    }

    Record[] public records;

    // ---------------- MODIFIERS ----------------
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyFaculty() {
        require(faculty[msg.sender], "Only faculty");
        _;
    }

    // ---------------- ADMIN ----------------
    function addStudent(
        string memory _name,
        uint _sem,
        address _wallet
    ) public onlyAdmin {
        students.push(Student(_name, _sem, _wallet));
    }

    function addFaculty(address _faculty) public onlyAdmin {
        faculty[_faculty] = true;
    }

    // ---------------- ATTENDANCE ----------------
    function markAttendance(
        address _student,
        string memory _subject,
        bool _present
    ) public onlyFaculty {
        records.push(
            Record(_student, _subject, block.timestamp, _present)
        );
    }

    // ---------------- GETTERS ----------------
    function getStudentCount() public view returns (uint) {
        return students.length;
    }

    function getStudent(uint index) public view returns (
        string memory,
        uint,
        address
    ) {
        Student memory s = students[index];
        return (s.name, s.sem, s.wallet);
    }

    function getRecords() public view returns (Record[] memory) {
        return records;
    }
}