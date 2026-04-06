// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {

    // -------------------- STRUCTS --------------------
    struct Record {
        address student;
        string subject;
        uint date;
        bool present;
    }

    // -------------------- STATE --------------------
    Record[] private records;
    mapping(address => bool) public faculty; // Only faculty can mark attendance

    // -------------------- EVENTS --------------------
    event AttendanceMarked(address indexed student, string subject, uint date, bool present);

    // -------------------- MODIFIERS --------------------
    modifier onlyFaculty() {
        require(faculty[msg.sender], "Only faculty can mark attendance");
        _;
    }

    // -------------------- FUNCTIONS --------------------
    // Admin adds a faculty member
    function addFaculty(address _faculty) public {
        // For simplicity, first deployer can add faculty
        require(!faculty[_faculty], "Already a faculty");
        faculty[_faculty] = true;
    }

    // Mark attendance (only faculty)
    function markAttendance(address _student, string memory _subject, bool _present) public onlyFaculty {
        records.push(Record(_student, _subject, block.timestamp, _present));
        emit AttendanceMarked(_student, _subject, block.timestamp, _present);
    }

    // Get total records (for small testing)
    function getAllRecords() public view returns (Record[] memory) {
        return records;
    }

    // Get records by student (filter off-chain)
    function getRecordCount() public view returns (uint) {
        return records.length;
    }

    function getRecord(uint index) public view returns (address student, string memory subject, uint date, bool present) {
        Record memory r = records[index];
        return (r.student, r.subject, r.date, r.present);
    }
}