const LandRegistry = artifacts.require("LandRegistry");

contract("LandRegistry", (accounts) => {
  const owner = accounts[0];
  const newOwner = accounts[1];

  let registry;

  beforeEach(async () => {
    registry = await LandRegistry.new();
  });

  it("registers land and returns land details", async () => {
    await registry.registerLand(1, "Sector 21, Plot A", 1800, { from: owner });

    const land = await registry.getLand(1);

    assert.equal(land.id.toString(), "1", "land id mismatch");
    assert.equal(land.location, "Sector 21, Plot A", "location mismatch");
    assert.equal(land.areaSqFt.toString(), "1800", "area mismatch");
    assert.equal(land.owner, owner, "owner mismatch");
  });

  it("transfers land ownership", async () => {
    await registry.registerLand(7, "Village Main Road", 2200, { from: owner });
    await registry.transferLand(7, newOwner, { from: owner });

    const land = await registry.getLand(7);
    assert.equal(land.owner, newOwner, "owner should be updated after transfer");
  });

  it("tracks lands by owner", async () => {
    await registry.registerLand(100, "Green Belt", 900, { from: owner });
    await registry.registerLand(101, "River Side", 1200, { from: owner });

    const ownerLands = await registry.getLandsByOwner(owner);
    const ids = ownerLands.map((id) => id.toString());

    assert.deepEqual(ids.sort(), ["100", "101"], "owner land ids mismatch");
  });

  it("rejects transfer from non-owner", async () => {
    await registry.registerLand(9, "Town Center", 1500, { from: owner });

    try {
      await registry.transferLand(9, newOwner, { from: newOwner });
      assert.fail("expected transfer to fail");
    } catch (error) {
      assert(
        error.message.includes("Only current owner can transfer"),
        `unexpected error message: ${error.message}`
      );
    }
  });
});
