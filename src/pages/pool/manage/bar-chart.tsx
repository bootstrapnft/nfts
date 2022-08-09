import { Axis, Chart, Geom, Tooltip } from "bizcharts";

const BarChart = ({ dataSource }: any) => {
    return (
        <div>
            <Chart
                renderer="svg"
                height={240}
                grid={null}
                autoFit
                data={dataSource}
            >
                <Tooltip shared />
                <Axis
                    name="date"
                    grid={null}
                    line={null}
                    tickLine={null}
                    label={{ style: { fill: "#ebebeb" } }}
                />
                <Axis
                    name="price"
                    grid={null}
                    line={null}
                    label={{ style: { fill: "#ebebeb" } }}
                />
                <Geom
                    type="interval"
                    position="date*price"
                    color="#31d399"
                    active={[
                        true,
                        {
                            highlight: true,
                            style: {
                                color: "#fff",
                            },
                        },
                    ]}
                />
            </Chart>
        </div>
    );
};

export default BarChart;
