/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017-20 M/Gateway Developments Ltd,                        |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  29 September 2020

*/

const validation = require('../../conduit/utilities/validation');
const errorHandler = require('../../conduit/utilities/errorHandler');
const db = require('../../conduit/db/objects');

module.exports = function(args, finished) {
  // validate JWT

  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let id = status.payload.id;
  let errors;

  let usernameToUnfollow = args.username;
  if (!usernameToUnfollow || usernameToUnfollow === '') {
    errors = errorHandler.add('username', "to unfollow must be specified", errors);
    return errorHandler.errorResponse(errors, finished);
  }

 if (usernameToUnfollow === db.users.getUsername.call(this, id)) {
    errors = errorHandler.add('username', "cannot be yourself", errors);
    return errorHandler.errorResponse(errors, finished);
  }

  if (!db.users.usernameExists.call(this, usernameToUnfollow)) {
    return finished({
      error: 'Not Found',
      status: {
        code: '404'
      }
    });
  }

  if (!db.users.follows.call(this, id, usernameToUnfollow)) {
    errors = errorHandler.add('username', "is not being followed", errors);
    return errorHandler.errorResponse(errors, finished);
  }

  let profile = db.users.unfollow.call(this, id, usernameToUnfollow);
  finished({profile: profile});
};
