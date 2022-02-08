import { Radio, Slider, Space } from "antd"
import React from "react"
import ReactDOM from "react-dom"
import { h } from "../lib/hyper"
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
    let div = h("div")

    ReactDOM.render(
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
                            let disabled = k == prop.currentCorner
                            return (
                                <Radio.Button
                                    key={k}
                                    style={{
                                        backgroundColor: disabled ? "grey" : colorValue,
                                        color:
                                            [0, 0, 0, 0, 1, 0, 1, 1][k] && !disabled
                                                ? "white"
                                                : "black",
                                    }}
                                    value={k}
                                    disabled={disabled}
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
                    value={100 * prop.levelGoal}
                    min={-100}
                    onChange={(value) => {
                        prop.updateLevelGoal(value / 100)
                    }}
                ></Slider>
            </div>
        </div>,
        div,
    )

    return div
}
