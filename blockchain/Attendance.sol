// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {
    struct Student {
        string name;
        bool isPresent;
    }

    mapping(address => Student) public students;
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    function addStudent(address _studentAddr, string memory _name) public onlyAdmin {
        students[_studentAddr] = Student(_name, false);
    }

    function markPresent(address _studentAddr) public onlyAdmin {
        students[_studentAddr].isPresent = true;
    }

    function getStudent(address _studentAddr) public view returns (string memory, bool) {
        Student memory s = students[_studentAddr];
        return (s.name, s.isPresent);
    }
}