import { Schema, model } from "mongoose";

interface CommandCounter {
  global: number;
  logs: {
    logsToggle: {
      used: number;
    };
    logsSet: {
      used: number;
    };
  };
  language: {
    languagePreview: {
      used: number;
    };
    languageSet: {
      used: number;
    };
  };
  account: {
    accountCreate: {
      used: number;
    };
    accountDelete: {
      used: number;
    };
  };
  job: {
    jobInformations: {
      used: number;
    };
    jobChange: {
      used: number;
    };
  };
  ban: {
    banAdd: {
      used: number;
    };
    banRemove: {
      used: number;
    };
  };
  timeout: {
    timeoutRemove: {
      used: number;
    };
    timeoutAdd: {
      used: number;
    };
  };
  kick: {
    used: number;
  };
  clear: {
    used: number;
  };
  botInfo: {
    used: number;
  };
  profile: {
    used: number;
  };
  serverInfo: {
    used: number;
  };
  userInfo: {
    used: number;
  };
  slowmode: {
    used: number;
  };
  announcement: {
    used: number;
  };
  help: {
    used: number;
  };
  stats: {
    commands: {
      used: number;
    };
  };
}

export default model<CommandCounter>(
  "CommandCounter",
  new Schema<CommandCounter>({
    global: Number,
    logs: {
      logsToggle: {
        used: Number,
      },
      logsSet: {
        used: Number,
      },
    },
    language: {
      languagePreview: {
        used: Number,
      },
      languageSet: {
        used: Number,
      },
    },
    account: {
      accountCreate: {
        used: Number,
      },
      accountDelete: {
        used: Number,
      },
    },
    job: {
      jobInformations: {
        used: Number,
      },
      jobChange: {
        used: Number,
      },
    },
    ban: {
      banAdd: {
        used: Number,
      },
      banRemove: {
        used: Number,
      },
    },
    timeout: {
      timeoutRemove: {
        used: Number,
      },
      timeoutAdd: {
        used: Number,
      },
    },
    kick: {
      used: Number,
    },
    clear: {
      used: Number,
    },
    botInfo: {
      used: Number,
    },
    profile: {
      used: Number,
    },
    serverInfo: {
      used: Number,
    },
    userInfo: {
      used: Number,
    },
    slowmode: {
      used: Number,
    },
    announcement: {
      used: Number,
    },
    help: {
      used: Number,
    },
    stats: {
      commands: {
        used: Number,
      },
    },
  })
);
