import axios from "axios";

export const fetchDroneData = async (url) => {
  try {
    const result = await axios(url);
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const fetchPilotInfo = async (violations) => {
  const url = `${process.env.REACT_APP_BASE_URL}/birdnest/pilots`;
  try {
    const calls = violations.map((v) => {
      const serialNumber = v.serialNumber;
      return axios.get(`${url}/${serialNumber}`);
    });

    // make multiple calls
    axios.all(calls).then(
      axios.spread((...response) => {
        const tempForm = response.map((res) => res.data);
        const finalForm = [...violatingPilots, ...tempForm];
        let uniqueObjArray = [
          ...new Map(finalForm.map((item) => [item["pilotId"], item])).values(),
        ];
        setViolatingPilots(uniqueObjArray);
      })
    );
  } catch (error) {
    throw new Error(error);
  }
};
