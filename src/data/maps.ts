import { MapData } from '../types/types'

import walk from './walk.json'
// import buttonImg from './images/button.png'

import button from './button.json'
import buttonImg from './images/button.png'

import stairs from './stairs.json'
import stairsImg from './images/stairs.png'

import wall from './wall.json'
import wallImg from './images/wall.png'

import cliff from './cliff.json'
import cliffImg from './images/cliff.png'

import cannonRecoil from './cannonRecoil.json'
import cannonRecoilImg from './images/cannonRecoil.png'

import dustRiver from './dustRiver.json'
import dustRiverImg from './images/dustRiver.png'

import dustPipe from './dustPipe.json'
import dustPipeImg from './images/dustPipe.png'

import greenRiver from './greenRiver.json'
import greenRiverImg from './images/greenRiver.png'

import lake from './lake.json'
import lakeImg from './images/lake.png'

import map0 from './map0.json'
import map1 from './map1.json'
import map2 from './map2.json'

import mountains from './mountains.json'

import mapStarter from './starter.json'

export const maps: MapData[] = [
    { id: 'walk', name: 'walk', objects: walk },
    { id: 'button', name: 'button', image: buttonImg, objects: button as any },
    { id: 'stairs', name: 'stairs', image: stairsImg, objects: stairs as any },
    { id: 'cliff', name: 'cliff', image: cliffImg, objects: cliff as any },
    { id: 'wall', name: 'wall', image: wallImg, objects: wall as any },

    // Cannon ↓
    { id: 'cannon', name: 'cannon', objects: [] }, // TODO
    {
        id: 'cannon-recoil',
        name: 'cannon-recoil',
        image: cannonRecoilImg,
        objects: cannonRecoil as any,
    },
    { id: 'dust-river', name: 'dust-river', image: dustRiverImg, objects: dustRiver as any },
    { id: 'dust-pipe', name: 'dust-pipe', image: dustPipeImg, objects: dustPipe as any },
    { id: 'green-river', name: 'green-river', image: greenRiverImg, objects: greenRiver as any },

    // Crossbow ↓
    { id: 'crossbow', name: 'crossbow', objects: [] }, // TODO
    { id: 'mountains', name: 'mountains', objects: mountains as any }, // TODO
    { id: 'lake', name: 'lake', image: lakeImg, objects: lake as any },

    // TODO remove
    { id: 'map-0', name: 'Test 0', objects: map0 as any },
    { id: 'map-1', name: 'Test 1', objects: map1 as any },
    { id: 'map-2', name: 'Test 2', objects: map2 as any },
    { id: 'starter', name: 'Editor', objects: mapStarter as any },
]