const Figma = require('figma-js');
const flatted = require('flatted');

export default async function handler(req, res) {
    const client = Figma.Client({
        // personalAccessToken: 'figd_cAj3NqUayq-YaWZXXynaeHyFSv0FUpR8ZiktyWEg',
        personalAccessToken: 'figd_06hAC8x5_bIiWqLdl4c6Y09S--eIkabjDnArmuOt',
    });

    const fileKey = 'eG9oxCYlvvYWDraiQUzalz';
    const sheboygan = 'UWjiCxyBeFAhbnjDeeRPx3';
    const componentNodeId = '1642-304';

    
    try {
        const file = await client.file(fileKey);
        const { data } = file;
        let result = Object.entries(file);
        let board = data.document.children[0];
        let page = board.children.filter(val => val.name === 'library-lg')[0];
        let widget = page.children.filter(val => val.name === 'testing')[0].children;
        

        res.status(200).json(widget || 'Nothing' );
    } catch (err) {
        console.error('Error fetching Figma file:', err);
        res.status(500).json({ error: 'Error fetching Figma file', err: err.message });
    }
}

