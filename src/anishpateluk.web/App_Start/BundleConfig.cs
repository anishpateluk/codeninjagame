namespace anishpateluk.web
{
    using System.Web.Optimization;

    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
          bundles.Add(
            new ScriptBundle("~/scripts/game").Include(
              "~/js/vendor/jquery-1.9.1.js",
              "~/js/vendor/jquery.hotkeys.js",
              "~/js/vendor/easeljs-0.6.0.js",
              "~/js/vendor/ndgmr.collision.js",
              "~/js/game/ContentManager.js",
              "~/js/game/CodeNinja.js",
              "~/js/game/Game.js"));

          BundleTable.EnableOptimizations = true;
        }
    }
}