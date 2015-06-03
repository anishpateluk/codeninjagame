namespace anishpateluk.web.Controllers
{
    using System.Web;
    using System.Web.Mvc;

    public class HomeController : Controller
    {
        public ActionResult Index() {
            var userAgentString = HttpContext.Request.UserAgent != null ? HttpContext.Request.UserAgent.ToLowerInvariant() : string.Empty;

            var isMobile = userAgentString.Contains("mobi");
            return View(isMobile);
        }
    }
}
