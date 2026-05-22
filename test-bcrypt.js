const bcrypt = require('bcryptjs');
const hash = "$2b$12$dqlrZrdZExFd6uJjTVLiBeV4lnsJE9hoVtvqwyfkAY45Iuq9El/uK";
async function run() {
  try {
    const res = await bcrypt.compare("ducklab", hash); // guessing password
    console.log("Compare result:", res);
  } catch (err) {
    console.error("Bcrypt error:", err);
  }
}
run();
