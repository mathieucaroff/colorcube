import { Radio, Slider, Space } from "antd"
import React from "react"
import "antd/dist/antd.css"

export interface CubeCornerSelectorProp {
    setCorner: (corner: number) => void
    colorNameArray: string[]
    colorValueArray: string[]
    currentCorner: number
    levelGoal: number
    updateLevelGoal: (value: number) => void
}

export let CubeCornerSelector = (prop: CubeCornerSelectorProp) => {
    return (
        <div>
            <h3 style={{ padding: "8px", color: "white" }}>Cutting corner</h3>
            <div style={{ float: "left" }}>
                <Radio.Group
                    onChange={(ev) => {
                        prop.setCorner(ev.target.value)
                    }}
                >
                    <Space direction="vertical">
                        {prop.colorNameArray.map((_, k) => {
                            let color = prop.colorNameArray[k]
                            let colorValue = prop.colorValueArray[k]
                            let selected = k == prop.currentCorner
                            return (
                                <Radio.Button
                                    key={k}
                                    style={{
                                        backgroundColor: "black",
                                        color: "white",
                                        borderColor: colorValue,
                                        borderWidth: selected ? "3px" : "1px",
                                        fontWeight: selected ? "bold" : "normal",
                                    }}
                                    value={k}
                                    disabled={selected}
                                >
                                    {color}
                                </Radio.Button>
                            )
                        })}
                    </Space>
                </Radio.Group>
            </div>
            <div
                style={{
                    display: "inline-block",
                    height: 300,
                }}
            >
                <Slider
                    vertical
                    max={100}
                    value={50 * (prop.levelGoal + 1)}
                    min={0}
                    onChange={(value) => {
                        prop.updateLevelGoal(value / 50 - 1)
                    }}
                ></Slider>
            </div>
        </div>
    )
}
