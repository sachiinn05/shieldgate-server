const checkRequest = async (data) => {
  const { ip } = data;

  if (!ip) {
    return {
      allowed: false,
      message: "IP is required",
    };
  }

  return {
    allowed: true,
    message: `Request allowed for IP ${ip}`,
  };
};

module.exports = {
  checkRequest,
};