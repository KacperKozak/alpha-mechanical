import { uniqueId } from 'lodash'
import { Action } from 'redux'
import actionCreatorFactory from 'typescript-fsa'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { PROJECTILE_ELEVATION, FALL_ELEVATION } from '../config'
import { arrMerge, findById, findByXY } from '../helpers'
import { createMap } from '../mocks/mapMock'
import { getDefinition } from '../objects/definitions'
import {
    ActionEvent,
    ObjectInstance,
    ObjectInstanceData,
    ObjectTypes,
    Vector2,
    XY,
    MapData,
} from '../types/types'
import { flyResolver } from './resolvers/flyResolver'
import { moveResolver } from './resolvers/moveResolver'
import { rotateResolver } from './resolvers/rotateResolver'
import { ResolverResults } from './resolvers/types'
import { grappleResolver } from './resolvers/grappleResolver'

export interface GameState {
    queueStared: boolean
    queue: Action[]
    mapId: string | null
    mapName: string | null
    objects: ObjectInstance[]
    cleanObjectsState: ObjectInstance[]
}

export interface GameStateAware {
    game: GameState
}

// const mockObjects = createMap()

export const initialState: GameState = {
    queueStared: false,
    queue: [],
    mapId: null,
    mapName: null,
    objects: [],
    cleanObjectsState: [],
}

const gameAction = actionCreatorFactory('GG')
const queueAction = actionCreatorFactory('QUEUE')

export const loadMap = gameAction<MapData>('LOAD_MAP')
export const reset = gameAction('RESET')
export const win = gameAction('WIN')
export const lose = gameAction('LOSE')

export const enqueue = queueAction<Action | Action[]>('ENQUEUE')
export const tryNextAction = queueAction('TRY_NEXT_ACTION')
export const nextAction = queueAction<Action>('NEXT_ACTION')
export const queueEnd = queueAction('QUEUE_END')

export const move = gameAction<{ targetId: string; vector: Vector2 }>('MOVE')
export const rotate = gameAction<{ targetId: string; rotation: Vector2 }>('ROTATE')
export const equip = gameAction<{ targetId: string }>('EQUIP')
export const fall = gameAction<{ targetId: string }>('FALL')

export const projectile = gameAction<{ instance: ObjectInstance; byId: string }>('PROJECTILE')
export const fly = gameAction<{ targetId: string }>('FLY')
export const flyEnd = gameAction<{ targetId: string; hitTargetId?: string }>('FLY_END')
export const grapple = gameAction<{ targetId: string }>('GRAPPLE')

export const updateObject = gameAction<{
    targetId: string
    objectValues: Partial<ObjectInstance>
}>('UPDATE_OBJECT')
export const setObjectData = gameAction<{
    targetId: string
    data: Partial<ObjectInstanceData>
}>('SET_OBJECT_DATA')
export const remove = gameAction<string>('REMOVE')
export const tmpSpawn = gameAction<{ instance: ObjectInstance }>('TMP_SPAWN')

export const gameReducer = reducerWithInitialState(initialState)
    /*
     * Loading
     */
    .case(
        loadMap,
        (state, { id, name, objects }): GameState => ({
            ...initialState,
            mapId: id,
            mapName: name,
            objects,
            cleanObjectsState: objects,
        }),
    )
    .cases(
        [reset, lose],
        (state): GameState => ({
            ...state,
            queue: [],
            queueStared: false,
            objects: state.cleanObjectsState,
            cleanObjectsState: state.cleanObjectsState,
        }),
    )
    .case(
        win,
        (state): GameState => ({
            ...initialState,
        }),
    )

    /*
     * Queue
     */
    .case(
        enqueue,
        (state, action): GameState => ({
            ...state,
            queue: arrMerge(state.queue, action),
        }),
    )
    .case(
        nextAction,
        (state, action): GameState => ({
            ...state,
            queueStared: true,
            queue: state.queue.filter(a => a !== action),
        }),
    )
    .case(queueEnd, (state): GameState => ({ ...state, queueStared: false }))

    /*
     * User actions
     */
    .case(
        move,
        (state, { targetId, vector }): GameState => {
            const { actions, objects } = moveResolver(state, targetId, vector)
            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )
    .case(
        rotate,
        (state, { targetId, rotation }): GameState => {
            const { actions, objects } = rotateResolver(state, targetId, rotation)
            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )
    .case(
        equip,
        (state, { targetId }): GameState => {
            const { actions, objects } = equipResolver(state, targetId)
            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )

    /*
     * Projectiles
     */
    .case(
        projectile,
        (state, { instance, byId }): GameState => {
            const objDef = getDefinition(instance.type)
            const objects = [...state.objects, instance]

            const who = findById(state.objects, byId)!
            const event: ActionEvent = { who, vector: instance.rotation, state, self: instance }

            const launchActions = objDef.projectileLaunch?.(event) || []
            const actions = [fly({ targetId: instance.id }), ...launchActions]

            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )
    .case(
        fly,
        (state, { targetId }): GameState => {
            const { actions, objects } = flyResolver(state, targetId)
            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )
    .case(
        flyEnd,
        (state, { targetId, hitTargetId }): GameState => {
            const obj = findById(state.objects, targetId)
            const what = hitTargetId ? findById(state.objects, hitTargetId) : undefined

            const actions: Action[] = []
            if (obj) {
                const objDef = getDefinition(obj.type)
                const event: ActionEvent = {
                    who: null as any, // TODO,
                    what,
                    vector: obj.rotation,
                    state,
                    self: obj,
                }
                const hitActions = objDef.projectileHit?.(event) || []
                actions.push(...hitActions)
            }
            return { ...state, queue: arrMerge(state.queue, actions) }
        },
    )

    /*
     * Grapple
     */
    .case(
        grapple,
        (state, { targetId }): GameState => {
            const { actions, objects } = grappleResolver(state, targetId)
            return {
                ...state,
                objects,
                queue: arrMerge(state.queue, actions),
            }
        },
    )

    /*
     * Edit and internal actions
     */
    .case(
        setObjectData,
        (state, { targetId, data }): GameState => {
            const { actions, objects } = setObjectDataResolver(state, targetId, data)
            return { ...state, objects, queue: arrMerge(state.queue, actions) }
        },
    )
    .case(
        updateObject,
        (state, { targetId, objectValues }): GameState => {
            return {
                ...state,
                objects: state.objects.map(obj =>
                    obj.id === targetId ? { ...obj, ...objectValues } : obj,
                ),
            }
        },
    )
    .case(
        fall,
        (state, { targetId }): GameState => {
            return {
                ...state,
                objects: state.objects.map(obj =>
                    obj.id === targetId ? { ...obj, elevation: FALL_ELEVATION } : obj,
                ),
            }
        },
    )
    .case(
        remove,
        (state, targetId): GameState => ({
            ...state,
            objects: state.objects.filter(obj => obj.id !== targetId),
        }),
    )
    .case(
        tmpSpawn,
        (state, { instance }): GameState => ({
            ...state,
            objects: [...state.objects, instance],
        }),
    )

export const equipResolver = (state: GameState, targetId: string): ResolverResults => {
    const actions: Action[] = []
    const target = findById(state.objects, targetId)
    if (!target) return { objects: state.objects, actions: [] }

    const myObjects = findByXY(state.objects, target.xy).sort((a, b) => b.aIndex - a.aIndex)

    for (const obj of myObjects) {
        const objDef = getDefinition(obj.type)
        const event: ActionEvent = { who: target, vector: [0, 0], state, self: obj }
        actions.push(...(objDef.equip?.(event) || []))
    }

    return {
        actions,
        objects: state.objects,
    }
}

export const setObjectDataResolver = (
    { objects }: GameState,
    targetId: string,
    data: Partial<ObjectInstanceData>,
): ResolverResults => {
    const target = findById(objects, targetId)

    return {
        objects: objects.map(obj => {
            if (obj !== target) return obj
            return { ...obj, data: { ...obj.data, ...data } }
        }),
        actions: [],
    }
}
