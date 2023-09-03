import { teamColorMap } from './teamColorMap';
import './DataTable.css'

function DataTable(props) {
    const data = props.data;
    const name = props.name;
    const title = props.title;
    const headers = props.headers;

    return (
        <div>
            <h2>{title}</h2>
            <table className="table" >
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header} style={{ backgroundColor: teamColorMap[name] }} >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {['1st', '2nd', '3rd', '4th'].map((down) => (
                        <tr key={down}>
                            <td>{down}</td>
                            {headers.slice(1).map((key) => (
                                <td key={key}>{data[down][key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;