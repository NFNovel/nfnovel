// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./NFNovel.sol";

contract NFNovels is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _novelIds;
    mapping(uint256 => address) public novelAddresses;

    event NovelCreated(
        address novelContract,
        string novelTitle,
        string novelSymbol
    );

    function createNovel(string memory novelTitle)
        public
        onlyOwner
        returns (address novelContract)
    {
        _novelIds.increment();
        uint256 novelId = _novelIds.current();

        NFNovel novel = new NFNovel(novelTitle, _generateNovelSymbol(novelId));
        // make the owner the EOA calling createNovel, not the NFNovels (factory) CA
        novel.transferOwnership(msg.sender);

        novelAddresses[novelId] = novelContract = address(novel);

        emit NovelCreated(novelContract, novelTitle, novel.symbol());
    }

    function _generateNovelSymbol(uint256 novelId)
        private
        pure
        returns (string memory novelSymbol)
    {
        novelSymbol = string(
            abi.encodePacked("NFN-", Strings.toString(novelId))
        );
    }
}
