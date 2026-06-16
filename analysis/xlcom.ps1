# Shared: register an IOleMessageFilter so COM "server busy" (RPC_E_CALL_REJECTED/RETRYLATER)
# calls are retried instead of silently failing. Required for reliable Excel automation.
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

[ComImport, Guid("00000016-0000-0000-C000-000000000046"),
 InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IOleMessageFilter {
    [PreserveSig] int HandleInComingCall(int dwCallType, IntPtr hTaskCaller, int dwTickCount, IntPtr lpInterfaceInfo);
    [PreserveSig] int RetryRejectedCall(IntPtr hTaskCallee, int dwTickCount, int dwRejectType);
    [PreserveSig] int MessagePending(IntPtr hTaskCallee, int dwTickCount, int dwPendingType);
}

public class XlMessageFilter : IOleMessageFilter {
    [DllImport("Ole32.dll")]
    private static extern int CoRegisterMessageFilter(IOleMessageFilter newFilter, out IOleMessageFilter oldFilter);
    public static void Register() { IOleMessageFilter old; CoRegisterMessageFilter(new XlMessageFilter(), out old); }
    public static void Revoke()   { IOleMessageFilter old; CoRegisterMessageFilter(null, out old); }
    public int HandleInComingCall(int t, IntPtr c, int tc, IntPtr i) { return 0; }      // SERVERCALL_ISHANDLED
    public int RetryRejectedCall(IntPtr c, int tc, int reject) {
        if (reject == 2) return 150;   // SERVERCALL_RETRYLATER -> retry after 150ms
        return -1;                      // else cancel
    }
    public int MessagePending(IntPtr c, int tc, int p) { return 2; }                    // PENDINGMSG_WAITDEFPROCESS
}
"@
[XlMessageFilter]::Register()
