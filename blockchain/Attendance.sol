// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {

    struct Record {
        address student;
        string subject;
        uint date;
        bool present;
    }

    Record[] public records;

    function markAttendance(address _student, string memory _subject, bool _present) public {
        records.push(Record(_student, _subject, block.timestamp, _present));
    }

    function getRecords() public view returns (Record[] memory) {
        return records;
    }
}