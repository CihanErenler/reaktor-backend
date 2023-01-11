import xml2js from "xml2js";

const calculateDitanceToNest = (x, y) => {
  const x1 = Number(x);
  const y1 = Number(y);
  const x2 = 250000;
  const y2 = 250000;

  const val1 = x1 - x2;
  const val2 = y1 - y2;

  const distance = Math.sqrt(Math.pow(val1, 2) + Math.pow(val2, 2));
  return distance;
};

export const formatObject = (data) => {
  const dateString = data.report.capture[0].$.snapshotTimestamp;
  console.log(dateString);
  const options = {
    timeZone: "UTC",
    hourCycle: "h23",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const date = new Date(dateString);

  const drones = data.report.capture[0].drone.map((drone) => {
    const serialNumber = drone.serialNumber[0];
    const manufacturer = drone.manufacturer[0];
    const model = drone.model[0];
    const positionX = drone.positionX[0];
    const positionY = drone.positionY[0];
    const distanceToNest = calculateDitanceToNest(positionX, positionY);
    const violation = distanceToNest < 100000;

    const tempDrone = {
      serialNumber,
      manufacturer,
      model,
      positionX,
      positionY,
      distanceToNest,
      violation,
    };

    return tempDrone;
  });

  const finalForm = {
    timeStamp: date.toLocaleDateString("en-US", options),
    drones,
  };

  return finalForm;
};

export const parseXML = async (xml) => {
  try {
    const result = await xml2js.parseStringPromise(xml);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const detectViolation = (drones) => {
  const violations = drones.drones.filter((drone) => drone.violation);
  return violations;
};
