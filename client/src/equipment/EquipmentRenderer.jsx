import useGameStore from '../store/gameStore'
import IntakeConveyor from './IntakeConveyor'
import SortingDesk from './SortingDesk'
import PneumaticTube from './PneumaticTube'
import BatchBin from './BatchBin'
import SettlementVault from './SettlementVault'
import AutoSorter from './AutoSorter'
import ConveyorExtension from './ConveyorExtension'
import ReturnDesk from './ReturnDesk'
import StampValidator from './StampValidator'
import AutoSealBin from './AutoSealBin'
import FraudScanner from './FraudScanner'
import SpeedBelt from './SpeedBelt'
import DuplicateDetector from './DuplicateDetector'
import MegaBatchBin from './MegaBatchBin'
import LoadBalancer from './LoadBalancer'
import ExpressIntake from './ExpressIntake'
import AiSorter from './AiSorter'
import QualityControl from './QualityControl'
import SamedayVault from './SamedayVault'
import WireTerminal from './WireTerminal'
import PremiumLane from './PremiumLane'
import BackupGenerator from './BackupGenerator'
import HvacUnit from './HvacUnit'
import SurgeBuffer from './SurgeBuffer'
import SurveillanceCam from './SurveillanceCam'
import TeleportPad from './TeleportPad'
import StaffDesk from './StaffDesk'
import PottedPlant from './PottedPlant'
import WindowBeach from './WindowBeach'
import WindowForest from './WindowForest'
import RubberDuck from './RubberDuck'
import CoffeeMachine from './CoffeeMachine'
import { EQUIPMENT_TYPES } from '../../../shared/types.js'

const COMPONENT_MAP = {
  [EQUIPMENT_TYPES.INTAKE_CONVEYOR]: IntakeConveyor,
  [EQUIPMENT_TYPES.SORTING_DESK]: SortingDesk,
  [EQUIPMENT_TYPES.PNEUMATIC_TUBE]: PneumaticTube,
  [EQUIPMENT_TYPES.BATCH_BIN]: BatchBin,
  [EQUIPMENT_TYPES.SETTLEMENT_VAULT]: SettlementVault,
  [EQUIPMENT_TYPES.AUTO_SORTER]: AutoSorter,
  [EQUIPMENT_TYPES.CONVEYOR_EXTENSION]: ConveyorExtension,
  [EQUIPMENT_TYPES.RETURN_DESK]: ReturnDesk,
  [EQUIPMENT_TYPES.STAMP_VALIDATOR]: StampValidator,
  [EQUIPMENT_TYPES.AUTO_SEAL_BIN]: AutoSealBin,
  [EQUIPMENT_TYPES.FRAUD_SCANNER]: FraudScanner,
  [EQUIPMENT_TYPES.SPEED_BELT]: SpeedBelt,
  [EQUIPMENT_TYPES.DUPLICATE_DETECTOR]: DuplicateDetector,
  [EQUIPMENT_TYPES.MEGA_BATCH_BIN]: MegaBatchBin,
  [EQUIPMENT_TYPES.LOAD_BALANCER]: LoadBalancer,
  [EQUIPMENT_TYPES.EXPRESS_INTAKE]: ExpressIntake,
  [EQUIPMENT_TYPES.AI_SORTER]: AiSorter,
  [EQUIPMENT_TYPES.QUALITY_CONTROL]: QualityControl,
  [EQUIPMENT_TYPES.SAMEDAY_VAULT]: SamedayVault,
  [EQUIPMENT_TYPES.WIRE_TERMINAL]: WireTerminal,
  [EQUIPMENT_TYPES.PREMIUM_LANE]: PremiumLane,
  [EQUIPMENT_TYPES.BACKUP_GENERATOR]: BackupGenerator,
  [EQUIPMENT_TYPES.HVAC_UNIT]: HvacUnit,
  [EQUIPMENT_TYPES.SURGE_BUFFER]: SurgeBuffer,
  [EQUIPMENT_TYPES.SURVEILLANCE_CAM]: SurveillanceCam,
  [EQUIPMENT_TYPES.TELEPORT_PAD]: TeleportPad,
  [EQUIPMENT_TYPES.STAFF_DESK]: StaffDesk,
  [EQUIPMENT_TYPES.POTTED_PLANT]: PottedPlant,
  [EQUIPMENT_TYPES.WINDOW_BEACH]: WindowBeach,
  [EQUIPMENT_TYPES.WINDOW_FOREST]: WindowForest,
  [EQUIPMENT_TYPES.RUBBER_DUCK]: RubberDuck,
  [EQUIPMENT_TYPES.COFFEE_MACHINE]: CoffeeMachine,
}

export default function EquipmentRenderer() {
  const placedEquipment = useGameStore((s) => s.placedEquipment)

  return (
    <group>
      {placedEquipment.map((eq) => {
        const Component = COMPONENT_MAP[eq.type]
        if (!Component) return null
        return <Component key={eq.id} data={eq} />
      })}
    </group>
  )
}
