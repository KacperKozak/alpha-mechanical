import React from 'react'
import { limitVector } from '../helpers'
import { move } from '../state/gameReducer'
import { ObjectDefinition, ObjectTypes } from '../types/types'
import { Grass, Ground, Ice } from './models/Items'

const tileDebugComponent = (color: string) => (props: any) => (
    <div
        style={{ width: '100%', height: '100%', backgroundColor: color, fontSize: 9 }}
        {...props}
    />
)

export const tileTypeDefinitions: Partial<Record<ObjectTypes, ObjectDefinition>> = {
    [ObjectTypes.Grass]: {
        name: 'Grass',
        height: () => 0,
        Component: tileDebugComponent('green'),
        Component3d: Grass,
    },

    [ObjectTypes.Ice]: {
        name: 'Ice',
        height: () => 0,
        enter: ({ who, vector }) => [
            move({ targetId: who.id, vector: limitVector(vector, -1, 1) }),
        ],
        Component: tileDebugComponent('lightblue'),
        Component3d: Ice,
    },

    [ObjectTypes.RockFloor]: {
        name: 'Rock floor',
        height: () => 0,
        Component: tileDebugComponent('gray'),
        Component3d: Ground,
    },
}
