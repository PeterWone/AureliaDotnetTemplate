namespace Meshcutter
{
  public class SpaSettings
  {
    public int RefreshIntervalSeconds { get; set; }
    public string LabelServiceUrl { get; set; }
    public string LabelPrinter { get; set; }
    public int PrintPauseMs { get; set; }
  }
  public class ConnectionStrings
  {
    public string LocalCxn { get; set; }
    public string CDR { get; set; }
  }
  public class AppSettings
  {
    public ConnectionStrings ConnectionStrings { get; set; }
    public SpaSettings SpaSettings { get; set; }
  }
}