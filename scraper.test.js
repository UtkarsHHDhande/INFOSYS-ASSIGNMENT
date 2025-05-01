const { findCollaborations, competitors, targetCompany } = require('./scraper');

test('findCollaborations returns an array', async () => {
    const collaborations = await findCollaborations(competitors, targetCompany);
    expect(Array.isArray(collaborations)).toBe(true);
});

test('findCollaborations includes relevant results', async () => {
    const collaborations = await findCollaborations(competitors, targetCompany);
    collaborations.forEach(collaboration => {
        expect(collaboration.title.toLowerCase()).toContain(targetCompany.toLowerCase());
        competitors.forEach(competitor => {
            if (collaboration.title.toLowerCase().includes(competitor.toLowerCase())) {
                expect(collaboration.competitor).toBe(competitor);
            }
        });
    });
});