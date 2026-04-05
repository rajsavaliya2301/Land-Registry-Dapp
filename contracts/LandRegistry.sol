// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LandRegistry {
    struct Land {
        uint256 id;
        string location;
        uint256 areaSqFt;
        address owner;
        bool exists;
    }

    mapping(uint256 => Land) private lands;
    mapping(address => uint256[]) private ownerToLandIds;
    uint256[] private allLandIds;

    event LandRegistered(uint256 indexed landId, address indexed owner, string location, uint256 areaSqFt);
    event LandTransferred(uint256 indexed landId, address indexed previousOwner, address indexed newOwner);

    modifier landExists(uint256 landId) {
        require(lands[landId].exists, "Land does not exist");
        _;
    }

    function registerLand(uint256 landId, string calldata location, uint256 areaSqFt) external {
        require(!lands[landId].exists, "Land already registered");
        require(bytes(location).length > 0, "Location is required");
        require(areaSqFt > 0, "Area must be greater than 0");

        lands[landId] = Land({
            id: landId,
            location: location,
            areaSqFt: areaSqFt,
            owner: msg.sender,
            exists: true
        });

        ownerToLandIds[msg.sender].push(landId);
        allLandIds.push(landId);

        emit LandRegistered(landId, msg.sender, location, areaSqFt);
    }

    function transferLand(uint256 landId, address newOwner) external landExists(landId) {
        require(newOwner != address(0), "New owner cannot be zero address");

        Land storage land = lands[landId];
        address previousOwner = land.owner;

        require(msg.sender == previousOwner, "Only current owner can transfer");
        require(previousOwner != newOwner, "New owner must be different");

        _removeLandFromOwner(previousOwner, landId);
        ownerToLandIds[newOwner].push(landId);
        land.owner = newOwner;

        emit LandTransferred(landId, previousOwner, newOwner);
    }

    function getLand(uint256 landId)
        external
        view
        landExists(landId)
        returns (uint256 id, string memory location, uint256 areaSqFt, address owner)
    {
        Land storage land = lands[landId];
        return (land.id, land.location, land.areaSqFt, land.owner);
    }

    function verifyOwnership(uint256 landId, address claimant) external view landExists(landId) returns (bool) {
        return lands[landId].owner == claimant;
    }

    function getLandsByOwner(address ownerAddress) external view returns (uint256[] memory) {
        return ownerToLandIds[ownerAddress];
    }

    function getAllLandIds() external view returns (uint256[] memory) {
        return allLandIds;
    }

    function _removeLandFromOwner(address ownerAddress, uint256 landId) internal {
        uint256[] storage ownedLandIds = ownerToLandIds[ownerAddress];
        uint256 length = ownedLandIds.length;

        for (uint256 i = 0; i < length; i++) {
            if (ownedLandIds[i] == landId) {
                ownedLandIds[i] = ownedLandIds[length - 1];
                ownedLandIds.pop();
                return;
            }
        }

        revert("Land not found for owner");
    }
}
