import React, {useEffect, useState} from 'react';
import axios from 'axios';

const GenericObjects = ({ ogToken }) => {

    const [genericObjectsList, setGenericObjectsList] = useState(null);
    const [ogAccessToken, setOgAccessToken] = useState(null);

    // const match_type_query_all = "{ \"query\": { \"match_all\"} }";
    // const match_type_deleted = "{ \"query\": { \"match\": {\"deleted\": true} } }";
    const match_type_false = "{ \"query\": { \"match\": {\"deleted\": false} } }";

    useEffect(() => {
        if (!ogToken) {
            console.log("No ObjectsGrid access token in useEffect.");
            return;
        }

        console.log("Setting ObjectsGrid access token: ", ogToken);
        setOgAccessToken(ogToken);

    }, [ogToken]);

    useEffect(() => {
        if (ogAccessToken) {
            listGenericObjects();
        }
    }, [ogAccessToken]);

    const listGenericObjects = async () => {

        if (!ogAccessToken) {
            console.error("No objectsgrid token supplied to listGenericObjects");
            return;
        }

        const genericObjectsUrl = 'https://testapis.objectsgrid.com/genericobjects?query=' + match_type_false;

        try {
            const response = await axios.get(genericObjectsUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ObjectsGrid-AccessPoint': 'US',
                    'X-ObjectsGrid-PrincipalID': 'principal123',
                    // 'X-ObjectsGrid-RestApiVersion': 'stable',
                    'X-ObjectsGrid-SessionID': 'session123',
                    // 'Authorization': 'Bearer ' + ogAccessToken
                }
            });

            console.log("List Objects success: ", response.data);
            setGenericObjectsList(response.data);

        } catch (error) {
            console.error('getting Generic Objects list failed:', error.message || error);
        }
    };

    const createObject = async() => {

        const obj = '{\n' +
//        '  "id":"20008",\n' +
        '  "objectID": "My new Object",\n' + // An ID that the customer/client wants to apply
        '  "namespace": "namespace",\n' +
        '  "objecType": "product",\n' +
        '    "intAttributes": [\n' +
        '    {\n' +
        '      "name": "Attr1",\n' +
        '      "val": 123\n' +
        '    },\n' +
        '    {\n' +
        '      "name": "Attr2",\n' +
        '      "val": 1\n' +
        '    }\n' +
        '  ],\n' +
        '  "floatAttributes": [\n' +
        '    {\n' +
        '      "name": "Attr1",\n' +
        '      "val": 123.5\n' +
        '    },\n' +
        '    {\n' +
        '      "name": "Attr2",\n' +
        '      "val": 1.34567\n' +
        '    }\n' +
        '  ],\n' +
        '  "stringAttributes": [\n' +
        '    {\n' +
        '      "name": "Attr1",\n' +
        '      "val": "val1"\n' +
        '    },\n' +
        '    {\n' +
        '      "name": "Attr2",\n' +
        '      "val": "val2"\n' +
        '    }\n' +
        '  ],\n' +
        '  "booleanAttributes": [\n' +
        '    {\n' +
        '      "name": "Attr1",\n' +
        '      "val": true\n' +
        '    },\n' +
        '    {\n' +
        '      "name": "Attr2",\n' +
        '      "val": false\n' +
        '    }\n' +
        '  ],\n' +
        '  "dateAttributes": [\n' +
        '    {\n' +
        '      "name": "Attr1",\n' +
        '      "val": "2024-04-24T16:15:04.904054+03:00"\n' +
        '    },\n' +
        '    {\n' +
        '      "name": "Attr2",\n' +
        '      "val": "2024-04-24T16:15:04.904055+03:00"\n' +
        '    }\n' +
        '  ],\n' +
        '\n' +
        '    "referenceAttributes": [\n' +
        '    {\n' +
        '        "name": "ref123",\n' +
        '        "val": 11\n' +
        '    }\n' +
        '  ],\n' +
        '\n' +
        '  "objectAttributes": [\n' +
        '    {\n' +
        '        "name": "object123",\n' +
        '        "val": "{ \\"name\\": \\"objectTypeTest\\"}"\n' +
        '    }\n' +
        '  ],\n' +
        '\n' +
        '  "tags": [\n' +
        '    {\n' +
        '      "key": "Attr1",\n' +
        '      "val": "val1"\n' +
        '    },\n' +
        '    {\n' +
        '      "key": "Attr2",\n' +
        '      "val": "val2"\n' +
        '    }\n' +
        '  ]\n' +
        '}';

        const objectsGridCreateObjectUrl = "https://testapis.objectsgrid.com/genericobjects";

        try {
            const response = await axios.post(objectsGridCreateObjectUrl, obj, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ObjectsGrid-AccessPoint': 'US',
                    'X-ObjectsGrid-SessionID': 'session123',
                    'Authorization': 'Bearer ' + ogAccessToken
                }
            });

            // Set the ObjectsGrid token in the state so that it can be used in future API calls.
            console.log('CreateObject Response:', response);
            await listGenericObjects(response.data);

        } catch (error) {
            console.error('CreateObject failed:', error.message || error);
        }
    };

    const deleteGenericObject = async (objectId) => {

        const deleteUrl = 'https://testapis.objectsgrid.com/genericobjects/' + objectId;

        try {
            const response = await axios.delete(deleteUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ObjectsGrid-AccessPoint': 'US',
                    'X-ObjectsGrid-PrincipalID': 'principal123',
                    // 'X-ObjectsGrid-RestApiVersion': 'stable',
                    'X-ObjectsGrid-SessionID': 'session123',
                    'Authorization': 'Bearer ' + ogAccessToken
                }
            });

            console.log('Object deleted: ', response.data);
            await listGenericObjects(response.data);

        } catch (error) {
            console.error('Deleting Generic Object failed:', error.message || error);
        }
    }

    if (!genericObjectsList || genericObjectsList.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <div>
            <div style={{ display: "flex", gap: "5px", alignItems: "center", width: "100%" }}>
                <h2>Generic Objects</h2>
                <div>
                    <button className="button"  onClick={createObject}>Create Object</button>
                </div>
                <div>
                    <button className="button"  onClick={listGenericObjects}>Refresh</button>
                </div>
            </div>
            <table className="generic-objects-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Object Type</th>
                    <th>String Attributes</th>
                    <th>Integer Attributes</th>
                    <th>Float Attributes</th>
                    <th>Boolean Attributes</th>
                    <th>Date Attributes</th>
                    <th>Meta</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {genericObjectsList.map((obj) => (
                    <tr key={obj.id}>
                        <td>{obj.id}</td>
                        <td>{obj.objectType}</td>
                        <td>{JSON.stringify(obj.stringAttributes)}</td>
                        <td>{JSON.stringify(obj.intAttributes)}</td>
                        <td>{JSON.stringify(obj.floatAttributes)}</td>
                        <td>{JSON.stringify(obj.booleanAttributes)}</td>
                        <td>{JSON.stringify(obj.dateAttributes)}</td>
                        <td>{JSON.stringify(obj.meta)}</td>
                        <td>
                            <button onClick={() => deleteGenericObject(obj.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default GenericObjects;