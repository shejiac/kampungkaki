export const startRequest = async (req, res) => {
  // if user doesn't meet condition: generate code; else press start
  return res.json({ message: "Start request flow - placeholder" });
};

export const finishRequest = async (req, res) => {
  // generate code on PWD side; volunteer inputs to confirm
  return res.json({ message: "Finish request flow - placeholder" });
};
