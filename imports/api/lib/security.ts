/**
 * Check if user has one or more of the roles in roles-Array
 * 
 * @param userRoles String-Array with user roles
 * @param roles string-array with requires
 * @returns 
 */
export const userHasOneOrMoreRequiredRole = (userRoles:Array<string>, roles:Array<string>):boolean => {
    let i=0, maxA = userRoles.length;
    for(i=0; i<maxA; i++){
        const rA = userRoles[i];
        if ( roles.find( rB => rA == rB )) return true;
    }

    return false;
}